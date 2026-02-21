import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/ranking_model.dart';
import '../../providers/student_provider.dart';
import '../../services/ranking_service.dart';

class RankingView extends StatefulWidget {
  const RankingView({super.key});

  @override
  State<RankingView> createState() => _RankingViewState();
}

class _RankingViewState extends State<RankingView> {
  final RankingService _service = RankingService();
  List<RankingEntry> _rankings = [];
  bool _isLoading = true;
  String? _selectedJalur;
  String? _selectedWaveId;

  final List<String> _jalurOptions = [
    'REGULER',
    'PRESTASI_AKADEMIK',
    'PRESTASI_NON_AKADEMIK',
    'AFIRMASI',
  ];

  @override
  void initState() {
    super.initState();
    _fetchRankings();
  }

  Future<void> _fetchRankings() async {
    setState(() => _isLoading = true);
    _rankings = await _service.getRankings(
      jalur: _selectedJalur,
      waveId: _selectedWaveId,
    );
    setState(() => _isLoading = false);
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'LULUS':
        return Colors.green;
      case 'TIDAK_LULUS':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    final waves = context.watch<StudentProvider>().activeWaves;

    return Scaffold(
      appBar: AppBar(title: const Text('Ranking Seleksi')),
      body: Column(
        children: [
          // Filter Bar
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.grey[100],
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _selectedWaveId,
                    decoration: InputDecoration(
                      labelText: 'Gelombang',
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                    isExpanded: true,
                    items: [
                      const DropdownMenuItem(value: null, child: Text('Semua')),
                      ...waves.map(
                        (w) =>
                            DropdownMenuItem(value: w.id, child: Text(w.name)),
                      ),
                    ],
                    onChanged: (v) {
                      setState(() => _selectedWaveId = v);
                      _fetchRankings();
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _selectedJalur,
                    decoration: InputDecoration(
                      labelText: 'Jalur',
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                    isExpanded: true,
                    items: [
                      const DropdownMenuItem(value: null, child: Text('Semua')),
                      ..._jalurOptions.map(
                        (j) => DropdownMenuItem(
                          value: j,
                          child: Text(
                            j.replaceAll('_', ' '),
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ),
                    ],
                    onChanged: (v) {
                      setState(() => _selectedJalur = v);
                      _fetchRankings();
                    },
                  ),
                ),
              ],
            ),
          ),

          // Results
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _rankings.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.leaderboard_outlined,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Belum ada data ranking',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _fetchRankings,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: _rankings.length,
                      itemBuilder: (context, index) {
                        final r = _rankings[index];
                        final rank = index + 1;
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            leading: Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: rank <= 3
                                    ? const Color(
                                        0xFFFFD600,
                                      ).withValues(alpha: 0.2)
                                    : Colors.grey[200],
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Center(
                                child: Text(
                                  '$rank',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    color: rank <= 3
                                        ? const Color(0xFF1B5E20)
                                        : Colors.grey[700],
                                  ),
                                ),
                              ),
                            ),
                            title: Text(
                              r.namaLengkap,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: Text(
                              'NISN: ${r.nisn} • ${r.jalur.replaceAll('_', ' ')}',
                              style: const TextStyle(fontSize: 12),
                            ),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  r.finalScore?.toStringAsFixed(1) ?? '-',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(
                                      r.statusKelulusan,
                                    ).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    r.statusKelulusan,
                                    style: TextStyle(
                                      color: _getStatusColor(r.statusKelulusan),
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
