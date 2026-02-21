import 'package:flutter/material.dart';
import 'dart:io';
import '../services/document_service.dart';

class DocumentProvider with ChangeNotifier {
  final DocumentService _documentService = DocumentService();

  final Map<String, bool> _uploadingStates = {};
  final Map<String, double> _uploadProgress = {};

  bool isUploading(String field) => _uploadingStates[field] ?? false;
  double getProgress(String field) => _uploadProgress[field] ?? 0.0;

  Future<bool> uploadDocument(String field, File file) async {
    _uploadingStates[field] = true;
    _uploadProgress[field] = 0.5;
    notifyListeners();

    final result = await _documentService.uploadFile(file);

    if (result['success']) {
      final linked = await _documentService.linkDocument(field, result['url']);
      _uploadingStates[field] = false;
      _uploadProgress[field] = 1.0;
      notifyListeners();
      return linked;
    }

    _uploadingStates[field] = false;
    _uploadProgress[field] = 0.0;
    notifyListeners();
    return false;
  }
}
