class Contact {
  final int id;
  final String fullName;
  final String? jobTitle;
  final String role;
  final String? company;
  final String? email;
  final String? phone;
  final String? mobile;
  final String? website;
  final String? address;
  final String createdAt;
  final String updatedAt;

  Contact({
    required this.id,
    required this.fullName,
    this.jobTitle,
    required this.role,
    this.company,
    this.email,
    this.phone,
    this.mobile,
    this.website,
    this.address,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Contact.fromJson(Map<String, dynamic> json) {
    return Contact(
      id: json['id'] as int? ?? 0,
      fullName: json['full_name'] as String? ?? 'Unknown',
      jobTitle: json['job_title'] as String?,
      role: json['role'] as String? ?? 'General',
      company: json['company'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      mobile: json['mobile'] as String?,
      website: json['website'] as String?,
      address: json['address'] as String?,
      createdAt: json['created_at'] as String? ?? '',
      updatedAt: json['updated_at'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'job_title': jobTitle,
      'role': role,
      'company': company,
      'email': email,
      'phone': phone,
      'mobile': mobile,
      'website': website,
      'address': address,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}

class ExtractOCRResponse {
  final String status;
  final String message;
  final bool isDuplicate;
  final Contact contact;

  ExtractOCRResponse({
    required this.status,
    required this.message,
    required this.isDuplicate,
    required this.contact,
  });

  factory ExtractOCRResponse.fromJson(Map<String, dynamic> json) {
    return ExtractOCRResponse(
      status: json['status'] as String? ?? 'inserted',
      message: json['message'] as String? ?? '',
      isDuplicate: json['is_duplicate'] as bool? ?? false,
      contact: Contact.fromJson(json['contact'] as Map<String, dynamic>),
    );
  }
}

class RoleGroupResponse {
  final String role;
  final int count;
  final List<Contact> contacts;

  RoleGroupResponse({
    required this.role,
    required this.count,
    required this.contacts,
  });

  factory RoleGroupResponse.fromJson(Map<String, dynamic> json) {
    var rawList = json['contacts'] as List? ?? [];
    List<Contact> contactList =
        rawList.map((e) => Contact.fromJson(e as Map<String, dynamic>)).toList();

    return RoleGroupResponse(
      role: json['role'] as String? ?? 'General',
      count: json['count'] as int? ?? contactList.length,
      contacts: contactList,
    );
  }
}
