import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/announcement_model.dart';
import '../../services/announcement_service.dart';

class AnnouncementView extends StatefulWidget {
  const AnnouncementView({super.key});

  @override
  State<AnnouncementView> createState() => _AnnouncementViewState();
}

class _AnnouncementViewState extends State<AnnouncementView> {
  final AnnouncementService _service = AnnouncementService();
  List<Announcement> _announcements = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAnnouncements();
  }

  Future<void> _fetchAnnouncements() async {
    setState(() => _isLoading = true);
    _announcements = await _service.getAnnouncements();
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Pengumuman',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchAnnouncements,
              child: CustomScrollView(
                slivers: [
                  if (_announcements.any((a) => a.type == 'IMPORTANT'))
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: _buildFeaturedCard(
                          _announcements.firstWhere(
                            (a) => a.type == 'IMPORTANT',
                          ),
                        ),
                      ),
                    ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final a = _announcements[index];
                        return _buildTimelineItem(a);
                      }, childCount: _announcements.length),
                    ),
                  ),
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text(
                          'SEMUA PENGUMUMAN DITAMPILKAN',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildFeaturedCard(Announcement a) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFE0F2F1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFF00DDCB).withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF00DDCB),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'PENTING',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Hari Ini',
                style: TextStyle(color: Colors.grey, fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            a.title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            a.content,
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey[700],
              height: 1.5,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 16),
          InkWell(
            onTap: () => _showDetail(a),
            child: const Row(
              children: [
                Text(
                  'Lihat Detail',
                  style: TextStyle(
                    color: Color(0xFF00BFA5),
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                SizedBox(width: 4),
                Icon(
                  Icons.arrow_forward_rounded,
                  size: 14,
                  color: Color(0xFF00BFA5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(Announcement a) {
    final day = DateFormat('dd').format(a.createdAt);
    final month = DateFormat('MMM').format(a.createdAt).toUpperCase();

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Text(
                  day,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  month,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Card(
                child: InkWell(
                  onTap: () => _showDetail(a),
                  borderRadius: BorderRadius.circular(20),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                a.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                a.content,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.chevron_right_rounded,
                          color: Colors.grey,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDetail(Announcement a) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFE0F2F1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                a.type,
                style: const TextStyle(
                  color: Color(0xFF00BFA5),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              a.title,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              DateFormat('EEEE, dd MMMM yyyy HH:mm').format(a.createdAt),
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const Divider(height: 40),
            Text(
              a.content,
              style: const TextStyle(
                fontSize: 15,
                height: 1.6,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Tutup'),
            ),
          ],
        ),
      ),
    );
  }
}
