export const SCHEDULE = '每日 02:17、08:17、14:17、20:17（北京时间）采集；GitHub 调度可能延迟。';

export const READING_PROFILE = {
  topics: ['音乐制作', 'AI 音乐', '实时交互', '视听艺术', '空间音频', '写作与研究', '金融观察', '法律与版权', '机会与资助'],
  tools: ['Cubase', 'Kontakt', 'Ableton Live', 'Max/MSP', 'TouchDesigner', 'ACE Studio'],
};

export const REGIONS = [
  { id: 'macau', name: '澳门', calendarUrl: 'https://www.icm.gov.mo/cn/events/', calendarLabel: '澳门文化局活动日历' },
  { id: 'hongkong', name: '香港', calendarUrl: 'https://www.lcsd.gov.hk/clpss/tc/search/culture/GeneralSearchForm.do?searchType=date', calendarLabel: '香港康文署 · 文化节目搜寻（按日期）' },
  { id: 'zhuhai', name: '珠海', calendarUrl: 'https://wgltj.zhuhai.gov.cn/', calendarLabel: '珠海文广旅体局官方资讯' },
];

const localKeywords = ['音樂', '音乐', '藝術', '艺术', '文化', '展覽', '展览', '博物', '科技', '人工智能', '創新', '创新', '科創', '科创', '大學', '大学', '交通', '口岸', '通關', '通关', '演出', '音樂會', '音乐会', '金融', '財政', '财政', '政策', '法規', '法规', '法律', '版權', '版权', '知識產權', '知识产权', '資助', '资助', '補助', '补助', '徵集', '征集', '招募'];

export const SOURCES = [
  { id: 'openai-news', name: 'OpenAI News', platform: '官方博客', category: 'AI 动态', type: 'rss', url: 'https://openai.com/news/rss.xml', limit: 14 },
  { id: 'google-ai', name: 'Google AI', platform: '官方博客', category: 'AI 动态', type: 'rss', url: 'https://blog.google/technology/ai/rss/', limit: 12 },
  { id: 'huggingface', name: 'Hugging Face', platform: '官方博客', category: 'AI 动态', type: 'rss', url: 'https://huggingface.co/blog/feed.xml', limit: 12 },
  { id: 'yt-openai', name: 'OpenAI · YouTube', platform: 'YouTube', category: '视频分享', type: 'atom', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A', limit: 10 },
  { id: 'yt-anthropic', name: 'Anthropic · YouTube', platform: 'YouTube', category: '视频分享', type: 'atom', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrDwWp7EBBv4NwvScIpBDOA', limit: 10 },
  { id: 'yt-deepmind', name: 'Google DeepMind · YouTube', platform: 'YouTube', category: '视频分享', type: 'atom', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCP7jMXSY2xbc3KCAE0MHQ-A', limit: 10 },
  { id: 'github-skills', name: 'GitHub · Agent Skills', platform: 'GitHub', category: 'Skills', type: 'github', query: 'topic:agent-skills stars:>30 archived:false fork:false', url: 'https://github.com/topics/agent-skills', fallbackFeeds: ['https://github.com/vercel-labs/skills/releases.atom'], limit: 14 },
  { id: 'github-workflows', name: 'GitHub · AI 工作流', platform: 'GitHub', category: '工作流', type: 'github', query: 'topic:workflow-automation topic:ai stars:>50 archived:false fork:false', url: 'https://github.com/topics/workflow-automation', fallbackFeeds: ['https://github.com/langflow-ai/langflow/releases.atom'], limit: 12 },
  { id: 'github-ai', name: 'GitHub · AI 开源', platform: 'GitHub', category: '开源项目', type: 'github', query: 'topic:llm stars:>200 archived:false fork:false', url: 'https://github.com/topics/llm', fallbackFeeds: ['https://github.com/ollama/ollama/releases.atom'], limit: 14 },
  { id: 'hn-ai', name: 'Hacker News · AI 讨论', platform: 'Hacker News', category: '社区热议', type: 'hn', url: 'https://news.ycombinator.com/', limit: 12 },
  { id: 'x-search', name: 'X · Skills 与工作流', platform: 'X', category: '社区热议', type: 'x', url: 'https://x.com/search?q=agent%20skills&f=live', limit: 12 },
  { id: 'ableton-blog', name: 'Ableton · 创作与技术', platform: '官方博客', category: '音乐科技', topics: ['音乐制作'], type: 'rss', url: 'https://www.ableton.com/en/blog/feeds/latest/', limit: 12 },
  { id: 'steinberg-updates', name: 'Steinberg · 官方公告', platform: '官方公告', category: '音乐科技', topics: ['音乐制作'], type: 'rss', url: 'https://forums.steinberg.net/c/announcements/5.rss', limit: 12 },
  { id: 'derivative-community', name: 'TouchDesigner · 官方社区讨论', platform: '技术社区', category: '音乐科技', topics: ['实时交互', '视听艺术'], type: 'rss', url: 'https://forum.derivative.ca/latest.rss', keywords: ['audio', 'music', 'midi', 'osc', 'sound', 'particle', 'render', 'point cloud', 'splat', 'sensor'], allowEmpty: true, dateLabel: '社区发帖', limit: 8 },
  { id: 'ableton-link', name: 'Ableton Link · 正式发行', platform: 'GitHub', category: '音乐科技', topics: ['实时交互', '音乐制作'], type: 'releases', url: 'https://github.com/Ableton/link/releases', repository: 'Ableton/link', limit: 5 },
  { id: 'github-audio-ai', name: 'IRCAM ACIDS · 音频研究开源', platform: 'GitHub', category: '音乐科技', topics: ['AI 音乐', '实时交互'], type: 'github', query: 'org:acids-ircam archived:false fork:false', url: 'https://github.com/acids-ircam', fallbackFeeds: ['https://github.com/acids-ircam/nn_tilde/releases.atom'], limit: 10 },
  { id: 'github-audio-midi', name: 'GitHub · 音频转 MIDI', platform: 'GitHub', category: '音乐科技', topics: ['AI 音乐', '音乐制作'], type: 'github', query: 'topic:audio-to-midi stars:>20 archived:false fork:false', url: 'https://github.com/topics/audio-to-midi', fallbackFeeds: ['https://github.com/spotify/basic-pitch/releases.atom'], limit: 6 },
  { id: 'github-spatial-audio', name: 'GitHub · 空间音频', platform: 'GitHub', category: '音乐科技', topics: ['空间音频'], type: 'github', query: 'topic:spatial-audio stars:>20 archived:false fork:false', url: 'https://github.com/topics/spatial-audio', fallbackFeeds: ['https://github.com/videolabs/libspatialaudio/releases.atom'], limit: 8 },
  { id: 'github-music-research', name: 'GitHub · 音乐信息检索', platform: 'GitHub', category: '音乐科技', topics: ['AI 音乐', '写作与研究'], type: 'github', query: 'topic:music-information-retrieval stars:>50 archived:false fork:false', url: 'https://github.com/topics/music-information-retrieval', fallbackFeeds: ['https://github.com/librosa/librosa/releases.atom'], limit: 8 },
  { id: 'native-instruments', name: 'Native Instruments · 官方博客', platform: '官方博客', category: '音乐科技', topics: ['音乐制作'], jurisdiction: '国际', type: 'atom', url: 'https://www.native-instruments.com/blogs/blog.atom', limit: 8 },
  { id: 'hkma-news', name: '香港金管局 · 新闻', platform: '官方资讯', category: '财经动态', topics: ['金融观察'], jurisdiction: '香港', type: 'rss', url: 'https://www.hkma.gov.hk/chi/other-information/rss/rss_press-release.xml', limit: 10 },
  { id: 'hkma-circulars', name: '香港金管局 · 监管通告', platform: '官方资讯', category: '法律政策', topics: ['金融观察', '法律与版权'], jurisdiction: '香港', type: 'rss', url: 'https://www.hkma.gov.hk/chi/other-information/rss/rss_circulars.xml', limit: 8 },
  { id: 'hkma-scam-alert', name: '香港金管局 · 防骗提醒', platform: '官方资讯', category: '财经动态', topics: ['金融观察'], jurisdiction: '香港', type: 'rss', url: 'https://www.hkma.gov.hk/chi/other-information/rss/rss_scam-alert.xml', limit: 8 },
  { id: 'hkma-insight', name: '香港金管局 · 汇思', platform: '官方资讯', category: '财经动态', topics: ['金融观察'], jurisdiction: '香港', type: 'rss', url: 'https://www.hkma.gov.hk/chi/other-information/rss/rss_insight.xml', limit: 6 },
  { id: 'fed-news', name: '美联储 · 新闻', platform: '官方资讯', category: '财经动态', topics: ['金融观察'], jurisdiction: '美国', type: 'rss', url: 'https://www.federalreserve.gov/feeds/press_all.xml', limit: 8 },
  { id: 'ecb-news', name: '欧洲央行 · 新闻与讲话', platform: '官方资讯', category: '财经动态', topics: ['金融观察'], jurisdiction: '欧盟', type: 'rss', url: 'https://www.ecb.europa.eu/rss/press.html', limit: 8 },
  { id: 'sec-news', name: '美国SEC · 监管新闻', platform: '官方资讯', category: '财经动态', topics: ['金融观察', '法律与版权'], jurisdiction: '美国', type: 'rss', url: 'https://www.sec.gov/news/pressreleases.rss', limit: 8 },
  { id: 'uk-ipo', name: '英国知识产权局 · 动态', platform: '官方资讯', category: '法律政策', topics: ['法律与版权'], jurisdiction: '英国', type: 'atom', url: 'https://www.gov.uk/government/organisations/intellectual-property-office.atom', limit: 8 },
  { id: 'uk-cma', name: '英国CMA · 平台与竞争监管', platform: '官方资讯', category: '法律政策', topics: ['法律与版权'], jurisdiction: '英国', type: 'atom', url: 'https://www.gov.uk/government/organisations/competition-and-markets-authority.atom', limit: 8 },
  { id: 'uk-dsit', name: '英国DSIT · 科技与AI政策', platform: '官方资讯', category: '法律政策', jurisdiction: '英国', type: 'atom', url: 'https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology.atom', limit: 8 },
  { id: 'wipo-news', name: 'WIPO · 知识产权新闻', platform: '官方资讯', category: '法律政策', topics: ['法律与版权'], jurisdiction: '国际', type: 'rss', url: 'https://www.wipo.int/pressroom/en/rss.xml', limit: 8 },
  { id: 'wipo-lex', name: 'WIPO Lex · 法律研究动态', platform: '官方资讯', category: '法律政策', topics: ['法律与版权', '写作与研究'], jurisdiction: '国际', type: 'rss', url: 'https://www.wipo.int/en/web/wipolex/news/-/journal/rss/497678/7224680', limit: 5 },
  { id: 'uk-legislation', name: '英国官方立法库 · 新发布文本', platform: '官方资讯', category: '法律政策', topics: ['法律与版权'], jurisdiction: '英国', type: 'atom', url: 'https://www.legislation.gov.uk/new/data.feed', keywords: ['copyright', 'intellectual property', 'digital', 'artificial intelligence', 'data protection'], allowEmpty: true, dateLabel: '文本发布', limit: 6 },
  { id: 'rsshub-releases', name: 'RSSHub · 正式发行', platform: 'GitHub', category: '工作流', type: 'releases', url: 'https://github.com/DIYgod/RSSHub/releases', repository: 'DIYgod/RSSHub', limit: 5 },
  { id: 'crawl4ai-releases', name: 'Crawl4AI · 正式发行', platform: 'GitHub', category: '工作流', type: 'releases', url: 'https://github.com/unclecode/crawl4ai/releases', repository: 'unclecode/crawl4ai', limit: 5 },
  { id: 'miniflux-releases', name: 'Miniflux · 正式发行', platform: 'GitHub', category: '工作流', type: 'releases', url: 'https://github.com/miniflux/v2/releases', repository: 'miniflux/v2', limit: 5 },
  { id: 'macau-news', name: '澳门特区政府 · 新闻', platform: '官方资讯', category: '本地新闻', scope: '文化、科技与通行', region: 'macau', type: 'rss', url: 'https://www.gov.mo/zh-hans/news/feed/', keywords: localKeywords, allowEmpty: true, limit: 10 },
  { id: 'macau-culture', name: '澳门文化局 · 新闻', platform: '官方资讯', category: '本地新闻', scope: '文化与演出', region: 'macau', type: 'icm-news', url: 'https://www.icm.gov.mo/cn/', limit: 10 },
  { id: 'hongkong-news', name: '香港特区政府 · 新闻公报', platform: '官方资讯', category: '本地新闻', scope: '文化、科技与通行', region: 'hongkong', type: 'rss', url: 'https://www.info.gov.hk/gia/rss/general_zh.xml', keywords: localKeywords, allowEmpty: true, limit: 10 },
  { id: 'zhuhai-news', name: '珠海市政府 · 珠海要闻', platform: '官方资讯', category: '本地新闻', scope: '文化、科技与通行', region: 'zhuhai', type: 'zhuhai-news', url: 'https://www.zhuhai.gov.cn/xw/xwzx/zhyw/index.html', keywords: localKeywords, allowEmpty: true, limit: 10 },
  { id: 'macau-events', name: '澳门文化局 · 活动日历', platform: '官方活动', scope: '活动', region: 'macau', type: 'event-rss', url: 'https://www.icm.gov.mo/rss/files/rssEvents_C.xml', keywords: ['音樂', '音乐', '展', '藝術', '艺术', '數字', '数字', '科技'], allowEmpty: true, limit: 20 },
  { id: 'macau-hush-2026', name: '澳门文化局 · hush! 2026', platform: '官方活动', scope: '活动', region: 'macau', type: 'event-table', url: 'https://www.icm.gov.mo/cn/news/detail/25185', year: 2026, publishedAt: '2026-10-28T00:00:00+08:00', allowEmpty: true, limit: 24 },
];
