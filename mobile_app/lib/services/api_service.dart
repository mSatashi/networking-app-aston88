import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/contact.dart';

class ApiService {
  // Configurable base URL
  static String _overrideBaseUrl = '';

  static void setBaseUrl(String url) {
    _overrideBaseUrl = url.trim().replaceAll(RegExp(r'/$'), '');
  }

  static String get baseUrl {
    if (_overrideBaseUrl.isNotEmpty) {
      return _overrideBaseUrl;
    }
    // Allow passing custom API URL via --dart-define=API_URL=https://...
    const envApiUrl = String.fromEnvironment('API_URL');
    if (envApiUrl.isNotEmpty) {
      return envApiUrl.replaceAll(RegExp(r'/$'), '').replaceAll(RegExp(r'/api$'), '');
    }

    // Default Staging Production URL
    return 'https://aston88.eksperimen.my.id';
  }

  /// Get list of contacts with optional filters
  static Future<List<Contact>> getContacts({
    String? role,
    String? company,
    String? search,
  }) async {
    final queryParams = <String, String>{};
    if (role != null && role.isNotEmpty && role.toLowerCase() != 'all') {
      queryParams['role'] = role;
    }
    if (company != null && company.isNotEmpty) {
      queryParams['company'] = company;
    }
    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }

    final uri = Uri.parse('$baseUrl/api/contacts').replace(queryParameters: queryParams);
    final response = await http.get(uri).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      final List rawList = jsonDecode(utf8.decode(response.bodyBytes));
      return rawList.map((item) => Contact.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load contacts (HTTP ${response.statusCode})');
    }
  }

  /// Get contacts grouped by role category
  static Future<List<RoleGroupResponse>> getContactsByRole() async {
    final uri = Uri.parse('$baseUrl/api/contacts/by-role');
    final response = await http.get(uri).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      final List rawList = jsonDecode(utf8.decode(response.bodyBytes));
      return rawList.map((item) => RoleGroupResponse.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load role grouping (HTTP ${response.statusCode})');
    }
  }

  /// Extract contact details from image URL via Roboflow OCR
  static Future<ExtractOCRResponse> extractFromUrl(String imageUrl) async {
    final uri = Uri.parse('$baseUrl/api/contacts/extract-url');
    final response = await http
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'image_url': imageUrl}),
        )
        .timeout(const Duration(seconds: 45));

    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode == 201) {
      return ExtractOCRResponse.fromJson(decoded);
    } else {
      final detail = decoded['detail'] ?? 'Failed to extract contact from image URL';
      throw Exception(detail);
    }
  }

  /// Extract contact details from uploaded image file via Roboflow OCR
  static Future<ExtractOCRResponse> extractFromFile(File imageFile) async {
    final uri = Uri.parse('$baseUrl/api/contacts/extract-file');
    final request = http.MultipartRequest('POST', uri);

    final multipartFile = await http.MultipartFile.fromPath('file', imageFile.path);
    request.files.add(multipartFile);

    final streamedResponse = await request.send().timeout(const Duration(seconds: 45));
    final response = await http.Response.fromStream(streamedResponse);
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));

    if (response.statusCode == 201) {
      return ExtractOCRResponse.fromJson(decoded);
    } else {
      final detail = decoded['detail'] ?? 'Failed to extract contact from image file';
      throw Exception(detail);
    }
  }

  /// Manually add contact
  static Future<Contact> createContactManually(Map<String, dynamic> data) async {
    final uri = Uri.parse('$baseUrl/api/contacts');
    final response = await http
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(data),
        )
        .timeout(const Duration(seconds: 15));

    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode == 201) {
      return Contact.fromJson(decoded);
    } else {
      final detail = decoded['detail'] ?? 'Failed to create contact';
      throw Exception(detail);
    }
  }

  /// Delete contact by ID
  static Future<void> deleteContact(int id) async {
    final uri = Uri.parse('$baseUrl/api/contacts/$id');
    final response = await http.delete(uri).timeout(const Duration(seconds: 15));

    if (response.statusCode != 204 && response.statusCode != 200) {
      throw Exception('Failed to delete contact ID $id');
    }
  }
}
