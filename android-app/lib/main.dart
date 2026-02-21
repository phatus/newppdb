import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/student_provider.dart';
import 'providers/document_provider.dart';
import 'shared/theme.dart';
import 'views/auth/login_view.dart';
import 'views/main_wrapper.dart';

import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('id_ID', null);
  Intl.defaultLocale = 'id_ID';

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => StudentProvider()),
        ChangeNotifierProvider(create: (_) => DocumentProvider()),
      ],
      child: const PMBMApp(),
    ),
  );
}

class PMBMApp extends StatelessWidget {
  const PMBMApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PMBM MTsN 1 Pacitan',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return auth.isAuthenticated ? const MainWrapper() : const LoginView();
        },
      ),
    );
  }
}
