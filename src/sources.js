export const SCHEDULE = '每日 02:17、08:17、14:17、20:17（北京时间）采集；GitHub 调度可能延迟。';

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
];
