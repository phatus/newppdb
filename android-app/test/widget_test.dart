import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:pmbm_app/main.dart';
import 'package:pmbm_app/providers/auth_provider.dart';
import 'package:pmbm_app/providers/student_provider.dart';
import 'package:pmbm_app/providers/document_provider.dart';

void main() {
  testWidgets('App should render', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
          ChangeNotifierProvider(create: (_) => StudentProvider()),
          ChangeNotifierProvider(create: (_) => DocumentProvider()),
        ],
        child: const PMBMApp(),
      ),
    );
    expect(find.text('PMBM Online'), findsOneWidget);
  });
}
