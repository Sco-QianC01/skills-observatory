export const SCHEDULE = '每日 02:17、08:17、14:17、20:17（北京时间）采集；GitHub 调度可能延迟。';

export const READING_PROFILE = {
  topics: ['音乐制作', 'AI 音乐', '实时交互', '视听艺术', '空间音频', '写作与研究'],
  tools: ['Cubase', 'Kontakt', 'Ableton Live', 'Max/MSP', 'TouchDesigner', 'ACE Studio'],
};

export const REGIONS = [
  { id: 'macau', name: '澳门', calendarUrl: 'https://www.icm.gov.mo/cn/events/', calendarLabel: '澳门文化局活动日历' },
  { id: 'hongkong', name: '香港', calendarUrl: 'https://www.lcsd.gov.hk/clpss/tc/search/culture/GeneralSearchForm.do?searchType=date', calendarLabel: '香港康文署 · 文化节目搜寻（按日期）' },
  { id: 'zhuhai', name: '珠海', calendarUrl: 'https://wgltj.zhuhai.gov.cn/', calendarLabel: '珠海文广旅体局官方资讯' },
];

const localKeywords = ['音樂', '音乐', '藝術', '艺术', '文化', '展覽', '展览', '博物', '科技', '人工智能', '創新', '创新', '科創', '科创', '大學', '大学', '交通', '口岸', '通關', '通关', '演出', '音樂會', '音乐会'];

export const SOURCES = [
  { id: 'openai-news', name: 'OpenAI News', platform: '官方博客', category: 'AI 动态', type: 'rss', url: 'https://openai.com/news/rss.xml', limit: 14 },
  { id: 'google-ai', name: 'Google AI', platform: '官方博客', category: 'AI 动态', type: 'rss', url: 'https://blog.google/technology/ai/rss/', limit: 12 },
  { id: 'huggingface', name: 'Hugging Face', platform: '官方博客', category: 'AI 动态', type: 'rss', url: 'https://huggingface.co/blog/feed.xml', limit: 12 },
  { id: 'yt-openai', name: 'OpenAI · YouTube', platform: 'YouTube', category: '视频分享', type: 'atom', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A', limit: 10 },
  { id: 'yt-anthropic', name: 'Anthropic · YouTube', platform: 'YouTube', category: '视频分享', type: 'atom', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrDwWp7EBBv4NwvScIpBDOA', limit: 10 },
  { id: 'yt-deepmind', name: 'Google DeepMind · YouTube', platform: 'YouTube', category: '视频分享', type: 'atom', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCP7jMXSY2xbc3KCAE0MHQ-A', limit: 10 },
  { id: 'github-skills', name: 'GitHub · Agent Skills', platform: 'GitHub', category: 'Skills', type: 'github', query: 'topic:agent-skills stars:>30 archived:false fork:false', url: 'https://github.com/topics/agent-skills', limit: 14 },
  { id: 'github-workflows', name: 'GitHub · AI 工作流', platform: 'GitHub', category: '工作流', type: 'github', query: 'topic:workflow-automation topic:ai stars:>50 archived:false fork:false', url: 'https://github.com/topics/workflow-automation', limit: 12 },
  { id: 'github-ai', name: 'GitHub · AI 开源', platform: 'GitHub', category: '开源项目', type: 'github', query: 'topic:llm stars:>200 archived:false fork:false', url: 'https://github.com/topics/llm', limit: 14 },
  { id: 'hn-ai', name: 'Hacker News · AI 讨论', platform: 'Hacker News', category: '社区热议', type: 'hn', url: 'https://news.ycombinator.com/', limit: 12 },
  { id: 'x-search', name: 'X · Skills 与工作流', platform: 'X', category: '社区热议', type: 'x', url: 'https://x.com/search?q=agent%20skills&f=live', limit: 12 },
  { id: 'ableton-blog', name: 'Ableton · 创作与技术', platform: '官方博客', category: '音乐科技', topics: ['音乐制作'], type: 'rss', url: 'https://www.ableton.com/en/blog/feeds/latest/', limit: 12 },
  { id: 'steinberg-updates', name: 'Steinberg · 官方公告', platform: '官方公告', category: '音乐科技', topics: ['音乐制作'], type: 'rss', url: 'https://forums.steinberg.net/c/announcements/5.rss', limit: 12 },
  { id: 'derivative-community', name: 'TouchDesigner · 官方社区讨论', platform: '技术社区', category: '音乐科技', topics: ['实时交互', '视听艺术'], type: 'rss', url: 'https://forum.derivative.ca/latest.rss', keywords: ['audio', 'music', 'midi', 'osc', 'sound', 'particle', 'render', 'point cloud', 'splat', 'sensor'], allowEmpty: true, dateLabel: '社区发帖', limit: 8 },
  { id: 'ableton-link', name: 'Ableton Link · 正式发行', platform: 'GitHub', category: '音乐科技', topics: ['实时交互', '音乐制作'], type: 'releases', url: 'https://github.com/Ableton/link/releases', repository: 'Ableton/link', limit: 5 },
  { id: 'github-audio-ai', name: 'IRCAM ACIDS · 音频研究开源', platform: 'GitHub', category: '音乐科技', topics: ['AI 音乐', '实时交互'], type: 'github', query: 'org:acids-ircam archived:false fork:false', url: 'https://github.com/acids-ircam', limit: 10 },
  { id: 'github-audio-midi', name: 'GitHub · 音频转 MIDI', platform: 'GitHub', category: '音乐科技', topics: ['AI 音乐', '音乐制作'], type: 'github', query: 'topic:audio-to-midi stars:>20 archived:false fork:false', url: 'https://github.com/topics/audio-to-midi', limit: 6 },
  { id: 'github-spatial-audio', name: 'GitHub · 空间音频', platform: 'GitHub', category: '音乐科技', topics: ['空间音频'], type: 'github', query: 'topic:spatial-audio stars:>20 archived:false fork:false', url: 'https://github.com/topics/spatial-audio', limit: 8 },
  { id: 'github-music-research', name: 'GitHub · 音乐信息检索', platform: 'GitHub', category: '音乐科技', topics: ['AI 音乐', '写作与研究'], type: 'github', query: 'topic:music-information-retrieval stars:>50 archived:false fork:false', url: 'https://github.com/topics/music-information-retrieval', limit: 8 },
  { id: 'macau-news', name: '澳门特区政府 · 新闻', platform: '官方资讯', category: '本地新闻', scope: '文化、科技与通行', region: 'macau', type: 'rss', url: 'https://www.gov.mo/zh-hans/news/feed/', keywords: localKeywords, allowEmpty: true, limit: 10 },
  { id: 'macau-culture', name: '澳门文化局 · 新闻', platform: '官方资讯', category: '本地新闻', scope: '文化与演出', region: 'macau', type: 'icm-news', url: 'https://www.icm.gov.mo/cn/', limit: 10 },
  { id: 'hongkong-news', name: '香港特区政府 · 新闻公报', platform: '官方资讯', category: '本地新闻', scope: '文化、科技与通行', region: 'hongkong', type: 'rss', url: 'https://www.info.gov.hk/gia/rss/general_zh.xml', keywords: localKeywords, allowEmpty: true, limit: 10 },
  { id: 'zhuhai-news', name: '珠海市政府 · 珠海要闻', platform: '官方资讯', category: '本地新闻', scope: '文化、科技与通行', region: 'zhuhai', type: 'zhuhai-news', url: 'https://www.zhuhai.gov.cn/xw/xwzx/zhyw/index.html', keywords: localKeywords, allowEmpty: true, limit: 10 },
  { id: 'macau-events', name: '澳门文化局 · 活动日历', platform: '官方活动', scope: '活动', region: 'macau', type: 'event-rss', url: 'https://www.icm.gov.mo/rss/files/rssEvents_C.xml', keywords: ['音樂', '音乐', '展', '藝術', '艺术', '數字', '数字', '科技'], allowEmpty: true, limit: 20 },
  { id: 'macau-hush-2026', name: '澳门文化局 · hush! 2026', platform: '官方活动', scope: '活动', region: 'macau', type: 'event-table', url: 'https://www.icm.gov.mo/cn/news/detail/25185', year: 2026, publishedAt: '2026-10-28T00:00:00+08:00', allowEmpty: true, limit: 24 },
];
