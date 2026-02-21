import 'package:flutter_test/flutter_test.dart';
import 'package:pmbm_app/main.dart';

void main() {
  testWidgets('App should render', (WidgetTester tester) async {
    await tester.pumpWidget(const PMBMApp());
    expect(find.text('PMBM Online'), findsOneWidget);
  });
}
