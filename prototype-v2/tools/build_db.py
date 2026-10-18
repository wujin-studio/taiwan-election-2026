# -*- coding: utf-8 -*-
"""Build data/db.json — the single source of truth for 2026 選戰切一刀.

Every record carries `status`:
  verified   = checked against a dated original source (news report quoting the
               campaign / official dataset / the campaign's own artwork) on 2026-10-18
  unverified = user-provided or editorial compilation; not yet matched to an original source
  missing    = we looked and have no reliable data; never filled with estimates
Run:  python3 -I tools/build_db.py   (from prototype-v2/)
"""
import json, os, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
V, U, M = 'verified', 'unverified', 'missing'

# ------------------------------------------------------------------ sources
S = {
 'cna-reg':   ('2026九合一選舉 22縣市長登記參選名單一次看', '中央社', '2026-09-04', 'https://www.cna.com.tw/news/aipl/202609045002.aspx'),
 'cna-chiang-hq': ('蔣萬安競辦成立 主視覺「台北安可」', '中央社', '2026-09-29', 'https://www.cna.com.tw/news/aipl/202609290204.aspx'),
 'bnext-tpe': ('台北市長科技政策比較：沈伯洋 vs 蔣萬安', '數位時代', '2026-10-06', 'https://www.bnext.com.tw/article/92509/taipei-mayor-2026-shen-chiang-tech-policy'),
 'cna-shen-kv': ('沈伯洋公布主視覺「台北順起來 FUTURE SOON」', '中央社', '2026-08-04', 'https://www.cna.com.tw/news/aloc/202608040069.aspx'),
 'cna-shen-merch': ('沈伯洋公布8款競選小物 奔奔、抱抱亮相', '中央社', '2026-08-25', 'https://www.cna.com.tw/news/aloc/202608250080.aspx'),
 'qs-tpe': ('台北市長社群聲量週報 10/05–10/11', 'QSearch', '2026-10-12', 'https://www.qsearch.cc/blog/2026/10/taipei-mayor-2026-social-volume-1005-1011/'),
 'qs-ntpc': ('新北市長社群聲量週報 10/05–10/11', 'QSearch', '2026-10-12', 'https://www.qsearch.cc/blog/2026/10/newtaipei-mayor-2026-social-volume-1005-1011/'),
 'udn-li-ad': ('李四川形象廣告「為你打造世界級新北」', '聯合報', '2026-08-03', 'https://udn.com/news/story/124652/9666834'),
 'fount-su': ('蘇巧慧競選總部開幕：溫暖、創新、會做事', 'Fount Media', '2026-10-02', 'https://www.fountmedia.io/article/430570'),
 'ltn-chang': ('張善政競選主軸「桃園前進、繼續挺善良」', '自由時報', '2026-09-20', 'https://news.ltn.com.tw/news/politics/breakingnews/5580451'),
 'udn-huang': ('黃世杰南區競總成立：心桃園，動起來', '聯合報', '2026-10-03', 'https://udn.com/news/story/124652/9792945'),
 'mirror-chiang': ('江啟臣專訪：台中躍升國際旗艦城', '鏡週刊', '2026-08-30', 'https://www.mirrormedia.mg/story/amp/20260824inv001'),
 'cna-tc': ('江啟臣「台中智造」、何欣純「欣潮純派飄帶」', '中央社', '2026-10-14', 'https://www.cna.com.tw/news/aipl/202610140288.aspx'),
 'storm-chiang-web': ('江啟臣「臺中味」競選網站上線：找出臺中味，走出臺中Way', '風傳媒', None, 'https://www.storm.mg/article/11154326'),
 'cna-tc-hq': ('盧秀燕任江啟臣競總主委 何欣純邀蘇嘉全扛召集人', '中央社', '2026-08-01', 'https://cna.com.tw/news/aloc/202608010062.aspx'),
 'now-ho': ('何欣純「六星市政168」巡迴說明會 西屯場', 'NOWnews', '2026-08-05', 'https://www.nownews.com/news/6863282'),
 'udn-ho-tour': ('巡迴說明會首場太平啟程 何欣純：我是屯區女兒、海線媳婦', '聯合報', None, 'https://udn.com/news/story/124652/9540053'),
 'udn-chen-traffic': ('陳亭妃「交通七彩行」AI動畫政見', '聯合報', '2026-09-22', 'https://udn.com/news/story/124652/9770764'),
 'ltn-chen-bear': ('陳亭妃推9款妃妃泰迪熊', '自由時報', '2026-09-22', 'https://news.ltn.com.tw/news/politics/breakingnews/5582214'),
 'cna-chen-hq': ('陳亭妃競選總部成立 賴總統站台', '中央社', '2026-10-11', 'https://cna.com.tw/news/aipl/202610110173.aspx'),
 'udn-khh-visual': ('縣市長候選人主視覺解析（高雄：柯志恩四色、賴瑞隆桃紅）', '中央社／聯合新聞網', '2026-10-11', 'https://udn.com/news/story/124652/9807165'),
 'cna-lai-brand': ('賴瑞隆公布桃紅主視覺與南方崛起敘事', '中央社', '2026-05-12', 'https://www.cna.com.tw/news/aloc/202605120165.aspx'),
 'cna-lai-video': ('百變隆隆競選影片／柯志恩市場掃街', '中央社', '2026-10-01', 'https://www.cna.com.tw/news/aloc/202610010129.aspx'),
 'cna-khh-ai': ('高雄AI產業政策：賴瑞隆亞灣聚落、柯志恩AI生態系', '中央社', '2026-10-12', 'https://www.cna.com.tw/news/aipl/202610120149.aspx'),
 'ko-site-traffic': ('柯志恩官網：交通建設政策', '柯志恩競選官網', '2026-09-22', 'https://kochihen2026.tw/policy/%E4%BA%A4%E9%80%9A%E5%BB%BA%E8%A8%AD'),
 'bt-ko': ('柯志恩專訪：傳產升級、能源與社會安全網', '今周刊', '2026-10-15', 'https://www.businesstoday.com.tw/article/category/183027/post/202610120035/'),
 'kcg-nanzi': ('高雄市都發局：楠梓產業園區進度', '高雄市政府都市發展局', '2026-08-01', 'https://urban-web.kcg.gov.tw/KDA/web_page/KDAN030201.jsp?PK01=KDA070000001202608015'),
 'kcg-s': ('高雄市半導體S廊帶簡介', '高雄市政府', None, 'https://orgws.kcg.gov.tw/001/KcgOrgUploadFiles/458/relfile/76950/63498/65f78e8b-3c66-4152-ba1f-b732f9c4af78.pdf'),
 'ct-chou': ('周春米公布競選LOGO與口號「希望城市、屏東亮起來」', '中時新聞網', '2026-10-13', 'https://www.chinatimes.com/realtimenews/20261013002830-260407'),
 'cna-su-rally': ('鄭麗文合體蘇清泉造勢 高喊「屏東大團結」', '中央社', '2026-09-19', 'https://cna.com.tw/news/aloc/202609190114.aspx'),
 'cna-su-2022': ('蘇清泉聲請重新驗票', '中央社', '2022-11-28', 'https://www.cna.com.tw/news/aipl/202211280103.aspx'),
 'udn-ptc': ('屏東市長雙姝對決 周佳琪登記：安居樂業好生活', '聯合報', '2026-09-04', 'https://udn.com/news/story/124652/9735138'),
 'nt-liang': ('梁育慈端午掃市場：會做事、肯打拚的團隊', '新頭殼', '2026-06-19', 'https://newtalk.tw/news/view/2026-06-19/1042269'),
 'bt-tvbs-tpe': ('TVBS民調：蔣萬安49%、沈伯洋41%', '今周刊', '2026-10-08', 'https://www.businesstoday.com.tw/article/category/183027/post/202610080048/'),
 'cna-ntpc-poll': ('民調拉開 蘇巧慧、李四川回應', '中央社', '2026-10-13', 'https://cna.com.tw/news/aipl/202610130087.aspx'),
 'ltn-ty-poll': ('新台灣國策智庫桃園市長民調', '自由時報', '2026-09-18', 'https://news.ltn.com.tw/news/politics/breakingnews/5582112'),
 'now-tc-poll': ('年代民調：2026台中市長選情', 'NOWnews', '2026-10-06', 'https://www.nownews.com/news/6881349'),
 'ris-048': ('鄉鎮市區人口密度（ODRP048，民國114年）', '內政部戶政司', '2025-12', 'https://www.ris.gov.tw/rs-opendata/api/v1/datastore/ODRP048/114'),
 'ris-11509': ('民國115年9月戶口統計資料分析', '內政部戶政司', '2026-10-08', 'https://www.ris.gov.tw/info-liferay/app/channel/newsDetail/26278263'),
 'dgbas-occ': ('人力資源調查統計年報：就業者之職業－按縣市別', '行政院主計總處', None, 'https://www.stat.gov.tw/'),
 'nlsc-towns': ('鄉鎮市區界線（經 dkaoster/taiwan-atlas 轉製，MIT）', '內政部國土測繪中心', None, 'https://github.com/dkaoster/taiwan-atlas'),
 'mol-23': ('勞動統計年報 表2-3 人力資源概況－按地區分（114年平均）', '勞動部（資料來源：主計總處人力資源調查）', '2025', 'https://statdb.mol.gov.tw/html/year/year14/32030.pdf'),
 'tpe-occ': ('臺北市統計年報 表35 臺北市就業人口之職業', '臺北市政府主計處（資料來源：主計總處人力資源調查統計年報）', '2025', 'https://www-ws.gov.taipei/001/Upload/367/relfile/48245/8011538/7db72b4a-9bb8-40ce-9ea9-329731d1f539.pdf'),
 'user': ('使用者 2026/10/17–18 整理之研究筆記（尚未逐條比對原文）', '使用者提供', '2026-10-18', None),
 'user-img': ('使用者提供之圖片檔（來源網址與授權待補）', '使用者提供', '2026-10-18', None),
 'editorial': ('編輯依公開史料整理；尚待逐條附原始出處', '本站編輯', '2026-10-18', None),
}
SOURCES = {k: {'title': t, 'publisher': p, 'date': d, 'url': u} for k, (t, p, d, u) in S.items()}

def it(text, status=V, src=None, date=None, **kw):
    d = {'text': text, 'status': status}
    if src: d['src'] = src if isinstance(src, list) else [src]
    if date: d['date'] = date
    d.update(kw)
    return d

PARTY = {
 '中國國民黨': {'short': '國民黨', 'color': '#2f5fa7'},
 '民主進步黨': {'short': '民進黨', 'color': '#2f8b57'},
}
def party(name):
    p = PARTY.get(name, {'short': name, 'color': '#8a8580'})
    return {'name': name, 'short': p['short'], 'color': p['color']}

# ------------------------------------------------------------------ candidates
C = []
def cand(**k):
    k.setdefault('subSlogans', []); k.setdefault('timeline', []); k.setdefault('record', [])
    k.setdefault('pledges', []); k.setdefault('controversies', []); k.setdefault('tactics', [])
    k.setdefault('visuals', []); k.setdefault('palette', []); k.setdefault('analysis', None)
    k.setdefault('photo', None); k.setdefault('incumbent', False); k.setdefault('metrics', None)
    k.setdefault('major', True); k.setdefault('identity', [])
    k['party'] = party(k['party'])
    C.append(k)

def minor(id, region, name, pty, note=None):
    cand(id=id, region=region, name=name, party=pty, major=False,
         slogan=it('未見正式競選口號', M, 'cna-reg'),
         identity=[it(f'已完成{ {"pingtung-city":"屏東市長"}.get(region, "縣市長")}參選登記（2026/8/31–9/4 登記期）', V, 'cna-reg')] + ([it(note, U, 'user')] if note else []))

PHOTO = lambda f: {'file': f'assets/img/portraits/{f}.jpg', 'status': U, 'src': ['user-img'],
                   'note': '使用者標註人物；本站以公開形象比對一致，但原始出處與使用授權尚未確認'}
VIS = lambda f, kind, cap, status=U, src='user-img', **kw: dict({'file': f'assets/img/visuals/{f}.jpg', 'kind': kind, 'caption': cap, 'status': status, 'src': [src] if isinstance(src, str) else src}, **kw)

# ---------- 臺北
cand(id='chiang-wan-an', region='taipei', name='蔣萬安', party='中國國民黨', incumbent=True,
  photo=None,
  slogan=it('台北安可', V, 'cna-chiang-hq', '2026-09-29', en='Taipei Encore'),
  subSlogans=[it('市政延長賽（媒體對連任框架的描述，非陣營口號）', U, 'bnext-tpe')],
  palette=['#1f6fd6', '#59bde9', '#ffd43b'],
  visuals=[VIS('chiang-taipei-encore', '競選識別標誌', '「台北安可 Taipei Encore」藍黃幾何識別；中央社報導其意象為舞台聚光燈與棒球應援棒', V, ['cna-chiang-hq', 'user-img'])],
  timeline=[it('「台北安可」主視覺與競辦同日發表', V, 'cna-chiang-hq', '2026-09-29')],
  analysis={
    'meaning': '「安可」是觀眾要求表演者再來一次的喝采。把連任包裝成「觀眾主動要求返場」，而不是候選人自己要求續任；「安」字同時帶出安心、安居的聯想。',
    'emotion': ['肯定', '延續', '熱場'],
    'promise': '既有市政路線值得再做一屆：北士科、捷運「六線齊發」、AI 市政等已啟動的工程與合約。',
    'needs': ['對現況相對滿意、重視穩定與延續的市民', '關心北士科與 AI 產業帶來就業的上班族', '在意已動工建設能否完工的通勤者'],
    'cityLinks': [
      {'kind': '產業', 'text': '北士科 T17/T18 輝達台灣總部地上權已簽約，「安可」把它當成要延續的成果', 'status': V, 'src': ['bnext-tpe']},
      {'kind': '年齡', 'text': '臺北 65 歲以上人口占 24.86%，全國最高（115年9月）；「安」的穩定訴求與高齡化城市的生活需求有關，但本站不據此推論哪個年齡層會支持誰', 'status': V, 'src': ['ris-11509']},
      {'kind': '行銷', 'text': '應援棒、聚光燈這類演唱會語彙，搭配平均 30 歲的五人核心團隊與 9 款群募小物，用來接觸年輕族群', 'status': V, 'src': ['cna-chiang-hq']},
    ],
    'limits': '連任型口號的說服力取決於選民怎麼評價現任；截至 10/6，媒體報導連任政見尚未完整發布，「再來一次」具體要多做什麼仍需觀察。',
  },
  record=[
    it('輝達台灣總部 北士科 T17、T18 地上權簽約：權利金 122 億元、50 年（可延 20 年）', V, 'bnext-tpe', '2026-02-11'),
    it('臺北市青年局成立', V, 'bnext-tpe', '2024-06'),
    it('1999 市民熱線導入 AI 查詢，人員查找時間約由 20 秒降至 2 秒', V, 'bnext-tpe'),
    it('內湖—南軟接駁專車上路', V, 'bnext-tpe', '2024-07'),
  ],
  pledges=[
    it('AI 教育白皮書：4 年 92 億元，北士科設 AI 教育中心', V, 'bnext-tpe', stage='規劃中'),
    it('AI 公共服務競爭型基金：5 年 10 億元', V, 'bnext-tpe', stage='規劃中'),
    it('自駕巴士三階段：2026 動物園試行 → 2027 上半年北士科沙盒 4 輛 → 2028 擴大', V, 'bnext-tpe', stage='試行中（6月底尚無一般營運許可）'),
    it('北士科永久變電所地下化，台電先建臨時變電所（約 20 個月）', V, 'bnext-tpe', stage='規劃中'),
    it('松山機場遷移與周邊土地重整', U, 'user', stage='倡議'),
  ],
  controversies=[
    it('社群熱議主題（QSearch 分群，非本站判斷是非）：松山機場遷移政見、毒品減害政策爭論、營養午餐與出席率', V, 'qs-tpe', '2026-10-11', response='陣營回應：本站尚未整理'),
  ],
  tactics=[
    {'ch': 'team', 'text': '競辦五位主管均為 8 年級生、平均 30 歲；發言人兼網路社群組長陳柏翰', 'status': V, 'src': ['cna-chiang-hq']},
    {'ch': 'merch', 'text': '9 款募款小物分 4 組、各限量 300 套，同日開放群募', 'status': V, 'src': ['cna-chiang-hq']},
    {'ch': 'hq', 'text': '9/29 競辦成立；競總日期未公布（使用者記錄 10/26 預定）', 'status': V, 'src': ['cna-chiang-hq']},
    {'ch': 'fb', 'text': '10/5–11 本人 Facebook 發文 7 則、平均留言 93', 'status': V, 'src': ['qs-tpe']},
    {'ch': 'threads', 'text': '10/5–11 本人 Threads 發文 0 則', 'status': V, 'src': ['qs-tpe']},
    {'ch': 'news', 'text': '電視政論專訪成為 Facebook 熱議主題之一（趙少康節目討論 5.6%）', 'status': V, 'src': ['qs-tpe']},
  ],
  metrics={'period': '2026-10-05/10-11', 'src': ['qs-tpe'], 'status': V, 'mentions': 31833, 'prev': 24729, 'change': 28.7,
           'sentiment': [12.0, 30.2, 57.8], 'posts': {'facebook': 7, 'threads': 0}, 'avgComments': {'facebook': 93, 'threads': 27},
           'negByChannel': {'threads': 72.8, 'facebook': 51.5, 'media': 43.2, 'forums': 69.2}},
  identity=[it('現任臺北市長，爭取連任', V, 'cna-reg')],
)
cand(id='shen-po-yang', region='taipei', name='沈伯洋', party='民主進步黨',
  photo=PHOTO('shen-po-yang'),
  slogan=it('台北順起來', V, 'cna-shen-kv', '2026-08-04', en='FUTURE SOON'),
  subSlogans=[it('FUTURE SOON（英文副標）', V, 'cna-shen-kv'), it('HEART 五大主軸：Habitat／Empower／Accompany／Resilience／Time', V, 'bnext-tpe')],
  palette=['#f26a1b', '#1b1b1b', '#ffffff', '#3f9b62'],
  visuals=[VIS('shen-taipei-current', '洋流系列視覺', '「台北大洋流 THE TAIPEI CURRENT／FUTURE SOON」橘黑白船舶海浪圖像；是陣營官方還是支持者二創，尚未確認', U, 'user-img')],
  timeline=[
    it('公布主視覺「台北順起來 FUTURE SOON」：以橘色為主，兩個上揚箭頭交纏；並以手語手勢呈現「順」字', V, 'cna-shen-kv', '2026-08-04'),
    it('8 款競選小物發表，「奔奔」「抱抱」布偶亮相', V, 'cna-shen-merch', '2026-08-25'),
    it('使用者記錄：舊版 AI 主視覺曾下架（中央社 8/25 報導未提及，待查）', U, 'user'),
  ],
  analysis={
    'meaning': '「順」可以指通勤順、辦事順、生活順，把城市問題定義為「卡住」。它和候選人名字中的「洋」→「洋流」可以互相串連：流動、順勢都屬於同一組語彙。',
    'emotion': ['解壓', '輕快', '期待'],
    'promise': '把日常摩擦降下來：交通壅塞、青年生活成本與市政流程。',
    'needs': ['內湖、南港等科技園區的通勤族', '青年與學生（青年 AI 額度、城市青年基金）', '家中有育兒或長照需求的家庭（HEART 中的 Accompany）'],
    'cityLinks': [
      {'kind': '交通', 'text': '內湖科技園區通勤：錯峰上班、電動小巴、共享機車納入 TPASS、跨基隆河自行車橋', 'status': V, 'src': ['bnext-tpe']},
      {'kind': '年齡', 'text': '青年 AI 使用支持：18–25 歲每月 300 元，第二階段延伸到 45 歲以下，兩階段共 9 億元', 'status': V, 'src': ['bnext-tpe']},
      {'kind': '可及性', 'text': '以手語手勢呈現「順」，讓聽障者等更多族群看得懂主視覺', 'status': V, 'src': ['cna-shen-kv']},
    ],
    'limits': '「順」是感受型承諾，需要用通勤時間、案件處理天數等指標驗證；青年基金每年約 18–20 億元，財源規劃需要另外檢視。',
  },
  pledges=[
    it('北士科「城市研究院」：70–80 名博士級研究員，研究都市規劃、交通與 AI 演算法', V, 'bnext-tpe', stage='政見'),
    it('青年 AI 使用支持方案：兩階段共 9 億元', V, 'bnext-tpe', stage='政見'),
    it('城市青年基金：18–22 歲每月 1,500 元（弱勢 3,000 元），每年約 18–20 億元', V, 'bnext-tpe', stage='政見'),
    it('政府採購保留一定比例給新創', V, 'bnext-tpe', stage='政見'),
    it('變電所室內化、部分地下化，結合無人公車充電站與 24 小時圖書館', V, 'bnext-tpe', stage='政見'),
    it('內湖交通：錯峰與彈性工時、電動小巴、共享機車納入 TPASS', V, 'bnext-tpe', stage='政見'),
  ],
  controversies=[
    it('跨基隆河自行車橋（約 9.5 億元）', V, 'bnext-tpe', response='蔣萬安：市府兩年前評估過，認為不可行'),
    it('社群熱議主題（QSearch 分群）：毒品減害政策爭論、少康戰情室專訪', V, 'qs-tpe', '2026-10-11', response='陣營回應：本站尚未整理'),
  ],
  tactics=[
    {'ch': 'merch', 'text': '8 款台灣製限量小物，包含「奔抱玩偶」', 'status': V, 'src': ['cna-shen-merch']},
    {'ch': 'ugc', 'text': '「洋流」系列視覺在社群流傳；是官方還是二創待確認', 'status': U, 'src': ['user']},
    {'ch': 'car', 'text': '「洋流車掃」是 Facebook 熱議主題之一（2.0%）', 'status': V, 'src': ['qs-tpe']},
    {'ch': 'fb', 'text': '10/5–11 本人 Facebook 發文 33 則、平均留言 99', 'status': V, 'src': ['qs-tpe']},
    {'ch': 'threads', 'text': '10/5–11 本人 Threads 發文 32 則；Threads 互動前 20 名貼文中 14 篇為本人帳號', 'status': V, 'src': ['qs-tpe']},
    {'ch': 'line', 'text': 'LINE 互動、「市長你給我聽好」意見蒐集', 'status': U, 'src': ['user']},
    {'ch': 'news', 'text': '「台北順起來與順報」是 Facebook 熱議主題之一（4.4%）', 'status': V, 'src': ['qs-tpe']},
  ],
  metrics={'period': '2026-10-05/10-11', 'src': ['qs-tpe'], 'status': V, 'mentions': 44846, 'prev': 32253, 'change': 39.0,
           'sentiment': [29.7, 26.7, 43.6], 'posts': {'facebook': 33, 'threads': 32}, 'avgComments': {'facebook': 99, 'threads': 27},
           'negByChannel': {'threads': 38.7, 'facebook': 44.8, 'media': 44.5, 'forums': 64.7}},
  identity=[it('民進黨提名臺北市長參選人', V, 'cna-reg')],
)
minor('kuo-hsi', 'taipei', '郭璽', '台灣麻將最大黨')
minor('hsiao-wen-chien', 'taipei', '蕭文乾', '台灣SoR無法黨')
minor('tang-hsin-min', 'taipei', '唐新民', '三勢團結促進聯盟')
minor('lin-chih-cheng', 'taipei', '林志成', '無黨籍')

# ---------- 新北
cand(id='li-szu-chuan', region='new-taipei', name='李四川', party='中國國民黨',
  photo=PHOTO('li-szu-chuan'),
  slogan=it('新北世界級，新北創新局', V, 'udn-li-ad', '2026-08-03'),
  subSlogans=[it('為你打造世界級新北，永遠為你超越想像', V, 'udn-li-ad', '2026-08-03'), it('別人只抱怨路不通，他選擇把路打通（廣告開場語意）', V, 'udn-li-ad')],
  palette=['#2f5fa7', '#e8a33c', '#f3efe6'],
  visuals=[],
  timeline=[it('社群形象廣告上線：以施政解決問題、臺北大巨蛋及爭取輝達總部為主軸', V, 'udn-li-ad', '2026-08-03'),
            it('「川伯」工程人設、台語腔廣告與主題曲〈川好勢〉', U, 'user')],
  analysis={
    'meaning': '「世界級」用的是國際尺度的建設語言；「創新局」是開創新局面。兩句對仗，把候選人定位為能把大型工程做完的人。',
    'emotion': ['自信', '宏大', '務實'],
    'promise': '工程與跨域治理能力：從臺北的大型建設經驗，轉移到新北的交通和園區。',
    'needs': ['每天跨越雙北的通勤族', '期待淡海、林口等新市鎮補齊機能的居民', '重視基礎建設進度、想要「有感」工程的市民'],
    'cityLinks': [
      {'kind': '交通', 'text': '雙北 30 分鐘生活圈（使用者整理之政見，待原文）', 'status': U, 'src': ['user']},
      {'kind': '產業', 'text': '淡海科學城、新北大巨蛋（使用者整理之政見，待原文）', 'status': U, 'src': ['user']},
      {'kind': '行銷', 'text': '廣告以「把路打通」示範解決問題的人設，台語腔觸及在地庶民語境', 'status': V, 'src': ['udn-li-ad']},
    ],
    'limits': '「世界級」是高度抽象的承諾，需要用具體工期、預算和財源檢驗；工程人設也可能讓照顧、教育等非工程議題的能見度較低。',
  },
  pledges=[it('新北大巨蛋、淡海科學城', U, 'user', stage='政見'), it('居住新五箭', U, 'user', stage='政見'), it('雙北 30 分鐘生活圈', U, 'user', stage='政見')],
  tactics=[
    {'ch': 'yt', 'text': '社群形象短片：背影入鏡、庶民口吻', 'status': V, 'src': ['udn-li-ad']},
    {'ch': 'fb', 'text': '10/5–11 本人發文共 34 則；Facebook 平均留言 67、Threads 40', 'status': V, 'src': ['qs-ntpc']},
    {'ch': 'rally', 'text': '市場、廟宇、同鄉會掃街與大型造勢', 'status': U, 'src': ['user']},
  ],
  metrics={'period': '2026-10-05/10-11', 'src': ['qs-ntpc'], 'status': V, 'mentions': 3167, 'change': -8.3,
           'sentiment': [23.2, 38.1, 38.8], 'postsTotal': 34, 'avgComments': {'facebook': 67, 'threads': 40},
           'channelShare': {'threads': 16.4, 'facebook': 27.0, 'media': 49.5, 'forums': 7.1}},
  identity=[it('國民黨提名新北市長參選人；前臺北市副市長', V, 'cna-reg')],
)
cand(id='su-chiao-hui', region='new-taipei', name='蘇巧慧', party='民主進步黨',
  photo=None,
  slogan=it('溫暖、創新、會做事', V, 'fount-su', '2026-10-02'),
  subSlogans=[it('慧做事拚未來', V, 'fount-su'), it('2026新北慧贏', V, 'fount-su'), it('新世代扛起新時代', V, 'fount-su')],
  palette=['#f08a6c', '#f6e7d8', '#2f8b57'],
  visuals=[VIS('su-chiao-hui-wordmark', '主標準字', '「溫暖 創新 會做事｜新北市長候選人 蘇巧慧」珊瑚色標準字', U, 'user-img')],
  timeline=[it('競選總部開幕，入口放射型燈箱、水獺媽媽樂園、新北許願牆', V, 'fount-su', '2026-10-02'),
            it('9/5 競總成立（使用者記錄）', U, 'user', '2026-09-05')],
  analysis={
    'meaning': '三個詞依序回答三個問題：溫暖（怎麼對待人）、創新（往哪裡去）、會做事（能不能做到）。「會做事」直接回應選民對執行力的疑問；副口號用「慧」諧音嵌入名字。',
    'emotion': ['溫暖', '親近', '可信'],
    'promise': '照顧與效率並重：育兒、托育長照，加上 AI 簡政。',
    'needs': ['育兒家庭與雙薪家庭', '需要長照支持的家庭', '期待新北建立城市主體性、不只當臺北衛星城的居民'],
    'cityLinks': [
      {'kind': '行銷', 'text': 'Podcast「水獺媽媽巧巧話」經營 6 年，把角色 IP 化成競總的立體紙雕樂園', 'status': V, 'src': ['fount-su']},
      {'kind': '產業', 'text': '與台灣運動品牌 TAIWOLF 合作募款小物，最高方案 2,999 元', 'status': V, 'src': ['fount-su']},
      {'kind': '政策', 'text': '青年育兒宅、AI 簡政、新皇冠計畫（使用者整理，待原文）', 'status': U, 'src': ['user']},
    ],
    'limits': '三個形容詞的口號容易記，但較難直接對應到單一具體建設；需要用政見的落地時程來支撐。',
  },
  pledges=[it('青年育兒宅、托育與長照', U, 'user', stage='政見'), it('AI 簡政', U, 'user', stage='政見'), it('板橋科技園區、新皇冠觀光', U, 'user', stage='政見')],
  tactics=[
    {'ch': 'podcast', 'text': '「水獺媽媽巧巧話」Podcast，已經營 6 年', 'status': V, 'src': ['fount-su']},
    {'ch': 'hq', 'text': '競總設計：放射燈箱、打卡牆、水獺媽媽樂園、新北許願牆', 'status': V, 'src': ['fount-su']},
    {'ch': 'merch', 'text': 'TAIWOLF 聯名小物；可以帶自製應援物到現場交換限量髮夾', 'status': V, 'src': ['fount-su']},
    {'ch': 'ig', 'text': '發言人「躲鏡頭挑戰」短影音', 'status': V, 'src': ['fount-su']},
    {'ch': 'threads', 'text': '10/5–11 本人發文共 50 則；Facebook 平均留言 50、Threads 22', 'status': V, 'src': ['qs-ntpc']},
  ],
  metrics={'period': '2026-10-05/10-11', 'src': ['qs-ntpc'], 'status': V, 'mentions': 3331, 'change': -24.6,
           'sentiment': [38.5, 31.5, 29.9], 'postsTotal': 50, 'avgComments': {'facebook': 50, 'threads': 22},
           'channelShare': {'threads': 27.0, 'facebook': 23.2, 'media': 45.3, 'forums': 4.5}},
  identity=[it('民進黨提名新北市長參選人；立法委員', V, 'cna-reg')],
)
minor('su-hui-huang', 'new-taipei', '蘇輝湟', '無黨籍')

# ---------- 桃園
cand(id='chang-shan-cheng', region='taoyuan', name='張善政', party='中國國民黨', incumbent=True,
  photo=PHOTO('chang-shan-cheng'),
  slogan=it('桃園前進，繼續挺善良', U, 'ltn-chang', '2026-09-20', note='自由時報引述陣營人士；首波文宣尚未發布'),
  subSlogans=[it('挺善良（2022 年主軸，本次加上「繼續」）', V, 'ltn-chang')],
  palette=['#ffffff', '#2f5fa7', '#7fb7e6'],
  visuals=[],
  timeline=[it('2022：「挺善良」', V, 'ltn-chang', '2022'), it('2026：「桃園前進、繼續挺善良」（報導）', U, 'ltn-chang', '2026-09-20')],
  analysis={
    'meaning': '「善良」嵌入名字裡的「善」，「繼續」標示連任。「桃園前進」四個字和 2022 年民眾黨候選人賴香伶的口號相同，媒體解讀為藍白合作的訊號。',
    'emotion': ['溫和', '穩定', '向前'],
    'promise': '團隊說明「前進」是要凸顯四年在交通、醫療、產業的成果，並延伸到下一任的計畫。',
    'needs': ['持續移入的新住民與年輕家庭（住宅、通學）', '等待捷運綠線、橘線的通勤族', '對市政表現有具體感受的現有市民'],
    'cityLinks': [
      {'kind': '人口', 'text': '桃園人口年增 0.25%（全國第二）、9 月淨遷入 1,060 人（全國最多）', 'status': V, 'src': ['ris-11509']},
      {'kind': '施政評價', 'text': '施政滿意度 58.2%、不滿意 26.8%（新台灣國策智庫 9/15–17，屬「施政滿意度」題，不是投票支持度）', 'status': V, 'src': ['ltn-ty-poll']},
      {'kind': '住宅', 'text': '可負擔住宅：機捷 A20、A21 與中壢園區（使用者整理）', 'status': U, 'src': ['user']},
    ],
    'limits': '口號引述自報導，尚未見正式文宣；「善良」是人格訴求，政績面需要另外以交通進度檢驗（見爭議頁籤）。',
  },
  pledges=[it('可負擔住宅（A20/A21、中壢園區）', U, 'user', stage='政見'), it('通學廊道', U, 'user', stage='政見'), it('捷運綠線', U, 'user', stage='施工中（延伸段見爭議）')],
  controversies=[it('對手指出：綠線延伸中壢段流標 9 次，預算從 97 億元增加到 255 億元；航空城第三跑道、社宅與清華附醫也延宕', V, 'udn-huang', '2026-10-03', response='張善政陣營回應：本站尚未取得')],
  tactics=[{'ch': 'board', 'text': '首波大型看板將陸續出現（9/20 報導）', 'status': V, 'src': ['ltn-chang']},
           {'ch': 'news', 'text': '以施政成果為核心，由發言人進行議題攻防', 'status': U, 'src': ['user']}],
  identity=[it('現任桃園市長，爭取連任', V, 'cna-reg')],
)
cand(id='huang-shih-chieh', region='taoyuan', name='黃世杰', party='民主進步黨',
  photo=PHOTO('huang-shih-chieh'),
  slogan=it('心桃園，動起來', V, 'udn-huang', '2026-10-03'),
  subSlogans=[it('國門心都，世界桃園', V, 'udn-huang'), it('健康桃園、特色醫療、醫護安居', V, 'udn-huang'), it('心桃園，新市長', U, 'user')],
  palette=['#2f8b57', '#ffffff', '#9fd3b0'],
  timeline=[it('南區競總成立（中壢），賴清德總統、卓榮泰院長出席', V, 'udn-huang', '2026-10-03')],
  analysis={
    'meaning': '「心」同時指地理上的「國門心都」（機場所在地）和情感上的用心；「動起來」暗示目前「停住了」，是挑戰者常用的動態語言，直接連到軌道和公車政見。',
    'emotion': ['躍動', '改變', '年輕'],
    'promise': '讓交通和產業加速：捷運橘線延伸、公車改為三層級路網、桃竹苗大矽谷。',
    'needs': ['南桃園與海線（楊梅、觀音、新屋）的通勤族', '科技業就業者與求職者', '醫護人員（醫護安居方案）'],
    'cityLinks': [
      {'kind': '交通', 'text': '捷運橘線延伸至楊梅、觀音、新屋；公車三層級路網', 'status': V, 'src': ['udn-huang']},
      {'kind': '產業', 'text': '桃竹苗大矽谷、龍潭科學園區三期、爭取台積電回流', 'status': V, 'src': ['udn-huang']},
      {'kind': '醫療', 'text': '第二座醫學中心；醫護社宅資格、托育優先、通勤補貼', 'status': V, 'src': ['udn-huang']},
    ],
    'limits': '挑戰者的知名度仍是瓶頸：同一份民調中，知道黃世杰參選的受訪者為 22.5%，張善政為 40.6%。',
  },
  pledges=[it('捷運橘線延伸楊梅、觀音、新屋', V, 'udn-huang', stage='政見'), it('公車三層級路網', V, 'udn-huang', stage='政見'),
           it('桃竹苗大矽谷、龍潭科學園區三期', V, 'udn-huang', stage='政見'), it('第二醫學中心、醫護安居', V, 'udn-huang', stage='政見'), it('市營公車', U, 'user', stage='政見')],
  tactics=[{'ch': 'hq', 'text': '南、北區競總；南區由總統站台', 'status': V, 'src': ['udn-huang']},
           {'ch': 'ig', 'text': '政見圖文、青年社群；「四姐」諧音自嘲', 'status': U, 'src': ['user']}],
  identity=[it('民進黨提名桃園市長參選人', V, 'cna-reg')],
)

# ---------- 臺中
cand(id='chiang-chi-chen', region='taichung', name='江啟臣', party='中國國民黨',
  photo=None,
  slogan=it('打造臺中旗艦城', U, 'user', note='專訪中為「國際旗艦城市」；正式口號字樣待文宣確認'),
  subSlogans=[it('國際旗艦城市', V, 'mirror-chiang', '2026-08-30'), it('台中智造 布局全球', V, 'cna-tc', '2026-10-14'),
              it('找出臺中味，走出臺中Way', V, 'storm-chiang-web'), it('12345，台中更幸福', U, 'user')],
  palette=['#2f5fa7', '#d9b25b', '#f3efe6'],
  timeline=[it('8/1 旗艦城市工作站；盧秀燕擔任競總主委', V, 'cna-tc-hq', '2026-08-01'),
            it('專訪闡述「國際旗艦城市」', V, 'mirror-chiang', '2026-08-30'),
            it('「台中智造」產業政見記者會', V, 'cna-tc', '2026-10-14'),
            it('10/4 三子合體造勢（使用者記錄）', U, 'user', '2026-10-04')],
  analysis={
    'meaning': '「旗艦店」是一個品牌規模最大、最能代表品牌精神的門市；江啟臣自己的說法是要讓臺中成為 22 縣市的標竿。這是用商業品牌語言談城市定位。',
    'emotion': ['自豪', '企圖心', '穩健'],
    'promise': '延續盧秀燕市府的團隊，同時提高城市的國際能見度；產業面主打 AI 機器人和智慧製造。',
    'needs': ['工具機與精密機械產業的業者和從業者', '交通瓶頸下的通勤族', '期待薪資提升的年輕勞動者'],
    'cityLinks': [
      {'kind': '產業', 'text': '機器人製造重鎮、智慧製造園區、教育投資培育人才，市府協調在地產業、引入國際資源以提高薪資', 'status': V, 'src': ['cna-tc']},
      {'kind': '延續', 'text': '現任市長盧秀燕任競總主委，延續同黨市政團隊的品牌', 'status': V, 'src': ['cna-tc-hq']},
      {'kind': '交通', 'text': '20 項交通政見（使用者整理）', 'status': U, 'src': ['user']},
    ],
    'limits': '口號變體很多（旗艦城、臺中Way、台中智造），主訊息可能分散；12345 的意義尚未找到出處。',
  },
  pledges=[it('台中智造：機器人製造重鎮、智慧製造園區', V, 'cna-tc', stage='政見'), it('20 項交通政見', U, 'user', stage='政見'), it('州廳觀光廊帶', U, 'user', stage='政見')],
  tactics=[{'ch': 'web', 'text': '「臺中味」競選網站：不採傳統條列政見', 'status': V, 'src': ['storm-chiang-web']},
           {'ch': 'yt', 'text': '圍棋意象形象影片', 'status': U, 'src': ['user']},
           {'ch': 'rally', 'text': '10/4 三子合體造勢', 'status': U, 'src': ['user']}],
  identity=[it('國民黨提名臺中市長參選人；立法委員', V, 'cna-reg')],
)
cand(id='ho-hsin-chun', region='taichung', name='何欣純', party='民主進步黨',
  photo=None,
  slogan=it('六星市政168', V, 'now-ho', '2026-08-05', note='巡迴說明會及政策架構名稱；「六星」與「168」的意義，報導中沒有說明'),
  subSlogans=[it('生活首都', V, 'now-ho'), it('貼近你的欣（官網意見區）', V, 'now-ho'), it('欣潮純派', V, 'cna-tc', '2026-10-14'),
              it('行動 溫度 創新（主視覺文字）', V, 'user-img'), it('台中迎新向前行', U, 'user')],
  palette=['#e0559a', '#7b55b5', '#ffffff'],
  visuals=[VIS('ho-hsin-chun-banner', '主視覺橫幅', '粉紫底「台中 行動 溫度 創新」，搭配「純」字圓形標誌與學經歷（台中女中、成功大學、英國碩士）', U, 'user-img')],
  timeline=[it('「六星市政168」巡迴說明會（西屯場）', V, 'now-ho', '2026-08-05'),
            it('「欣潮純派飄帶」將在 10/18 太平—東區大會師首次亮相', V, 'cna-tc', '2026-10-14')],
  analysis={
    'meaning': '數字「168」好記，「六星」帶有評等的意味；「欣潮」（新潮）、「純派」把名字拆進流行語。「屯區女兒、海線媳婦」則用地緣身分，同時串起臺中的山、海、屯。',
    'emotion': ['親切', '新潮', '在地'],
    'promise': '「生活首都」：從空品、綠蔭到交通的日常生活品質。',
    'needs': ['在意中火空污的家庭', '屯區、海線等原縣區的居民', '年輕世代（流行語化的命名）'],
    'cityLinks': [
      {'kind': '地緣', 'text': '「我是屯區女兒、海線媳婦」', 'status': V, 'src': ['udn-ho-tour']},
      {'kind': '空品', 'text': '中火以氣換煤（使用者整理）', 'status': U, 'src': ['user']},
      {'kind': '行銷', 'text': '飄帶圖樣由梨山原韻茶庄授權、欣好店家製作，結合在地商家', 'status': V, 'src': ['cna-tc']},
    ],
    'limits': '「六星」與「168」的具體內容在公開報導中查不到；主口號需要靠解說才能讀懂。',
  },
  pledges=[it('中火以氣換煤', U, 'user', stage='政見'), it('山線三三三創新', U, 'user', stage='政見'), it('10 分鐘綠蔭生活圈', U, 'user', stage='政見'), it('西屯新政五大願景（捷運、會展、交通）', V, 'now-ho', stage='政見')],
  tactics=[{'ch': 'merch', 'text': '粉紫「欣潮純派飄帶」', 'status': V, 'src': ['cna-tc']},
           {'ch': 'rally', 'text': '10/18 東平夜市太平—東區大會師', 'status': V, 'src': ['cna-tc']},
           {'ch': 'web', 'text': '競選官網「貼近你的欣」意見區', 'status': V, 'src': ['now-ho']},
           {'ch': 'car', 'text': '大里車隊掃街', 'status': U, 'src': ['user']}],
  identity=[it('民進黨提名臺中市長參選人；立法委員', V, 'cna-reg')],
)
minor('hung-li-hua', 'taichung', '洪麗華', '司法正義黨')

# ---------- 臺南
cand(id='hsieh-lung-chieh', region='tainan', name='謝龍介', party='中國國民黨',
  photo=PHOTO('hsieh-lung-chieh'),
  slogan=it('翻轉大台南，人民贏一次', V, 'user-img', note='見於候選人政策廣告原圖；圖片原始出處待補'),
  subSlogans=[it('謝龍介爭取成長津貼：0–15 歲月月領 5000', V, 'user-img'), it('0–6 歲健保免費！6–18 歲每月加碼 2500', V, 'user-img')],
  palette=['#4aa3d8', '#c8312f', '#ffffff'],
  visuals=[VIS('hsieh-policy-banner', '政策廣告', '「翻轉大臺南 人民贏一次」橫幅，搭配成長津貼數字與線上捐款 QR；屬於政策廣告，不是純品牌主視覺', U, 'user-img')],
  analysis={
    'meaning': '「翻轉」是要求政黨輪替（臺南長期由民進黨執政）；「人民贏一次」把選舉講成庶民對抗長期執政者的勝利。政策廣告用超大數字「5000」，把抽象的翻轉化成每月可以領到的金額。',
    'emotion': ['逆轉', '草根', '直接'],
    'promise': '用現金型福利和政黨輪替改變現狀。',
    'needs': ['育有 0–18 歲子女的家庭', '感覺被長期執政忽略的鄉區居民', '習慣直播、台語語境的支持者'],
    'cityLinks': [
      {'kind': '人口', 'text': '臺南粗出生率 2.99‰，全國倒數第二（115年9月），可以對照育兒津貼的訴求', 'status': V, 'src': ['ris-11509']},
      {'kind': '行銷', 'text': '鐵皮屋競總、直播和庶民語言（使用者整理）', 'status': U, 'src': ['user']},
    ],
    'limits': '津貼的財源規模，以及哪些項目要由中央加碼，廣告中沒有說明；「翻轉」需要說清楚翻轉之後的施政藍圖。',
  },
  pledges=[it('成長津貼 0–15 歲每月 5,000 元；6–18 歲每月加碼 2,500 元；0–6 歲健保免費', V, 'user-img', stage='政見'), it('十大新政、婚育宅', U, 'user', stage='政見')],
  tactics=[{'ch': 'live', 'text': '直播與庶民語言', 'status': U, 'src': ['user']}, {'ch': 'hq', 'text': '鐵皮屋競總、泡茶活動', 'status': U, 'src': ['user']},
           {'ch': 'board', 'text': '政策廣告橫幅附線上捐款 QR', 'status': V, 'src': ['user-img']}],
  identity=[it('國民黨提名臺南市長參選人；立法委員', V, 'cna-reg')],
)
cand(id='chen-ting-fei', region='tainan', name='陳亭妃', party='民主進步黨',
  photo=None,
  slogan=it('妃常幸福', U, 'user', note='自由時報 9/22 報導中為「妃熊幸福的城市」「妃常旋風」，未見「妃常幸福」原字'),
  subSlogans=[it('台南400年第一女市長（活動背板）', V, 'user-img'), it('交通七彩行：路路相通、城鄉共榮', V, 'udn-chen-traffic', '2026-09-22'),
              it('攜手將台南堆疊成妃熊幸福的城市', V, 'ltn-chen-bear', '2026-09-22'), it('2026要贏，2028更要贏', U, 'user')],
  palette=['#2f8b57', '#e2457f', '#ffffff'],
  visuals=[VIS('chen-ting-fei-event', '活動現場照', '「台南400年 第一女市長」背板與團隊合照；是活動照片，不能當作正式主視覺', U, 'user-img')],
  timeline=[it('「交通七彩行」AI 動畫政見、9 款妃妃泰迪熊（每隻 1,680 元）', V, ['udn-chen-traffic', 'ltn-chen-bear'], '2026-09-22'),
            it('永康競選總部成立，賴清德總統授旗', V, 'cna-chen-hq', '2026-10-11')],
  analysis={
    'meaning': '把名字中的「妃」嵌進「非常」，形成暱稱品牌（妃妃、妃熊）；「第一女市長」配合臺南 400 年的歷史節點，製造「創造歷史」的敘事。',
    'emotion': ['幸福', '親暱', '歷史感'],
    'promise': '交通串連城鄉、觀光分散到各區：交通七彩行、五大觀光軸。',
    'needs': ['北部原縣區、公共運輸較弱地區的居民（糖鐵五分車、觀光輕軌）', '農漁、科技、軍警等不同職業社群（9 款主題熊）', '關注女性參政的選民'],
    'cityLinks': [
      {'kind': '交通', 'text': '捷運藍線之外加上深綠線、紅線形成半環；國道 1、3 號和台 61 線串連', 'status': V, 'src': ['udn-chen-traffic']},
      {'kind': '歷史', 'text': '「台南400年」對應 1624 年荷蘭建城的城市紀年', 'status': U, 'src': ['editorial']},
      {'kind': '行銷', 'text': '9 隻主題熊分別代表農家、科技、軍人等職業任務，屬於職業敘事的周邊商品；不代表該職業的投票傾向', 'status': V, 'src': ['ltn-chen-bear']},
    ],
    'limits': '暱稱型品牌很強調個人親和力，但政見的辨識度需要靠交通、觀光等具體計畫來補強。',
  },
  pledges=[it('交通七彩行：四東西三南北快速路網、鐵路地下化與捷運、糖鐵五分車與觀光輕軌', V, 'udn-chen-traffic', stage='政見'), it('五大觀光軸', U, 'user', stage='政見')],
  tactics=[{'ch': 'yt', 'text': 'AI 動畫政見影片', 'status': V, 'src': ['udn-chen-traffic']}, {'ch': 'merch', 'text': '9 款妃妃泰迪熊', 'status': V, 'src': ['ltn-chen-bear']},
           {'ch': 'hq', 'text': '永康競總（使用者記錄為貨櫃屋設計、跑道數字1，待查）', 'status': U, 'src': ['user']}],
  identity=[it('民進黨提名臺南市長參選人；立法委員', V, 'cna-reg')],
)
minor('hsiao-lin-hung', 'tainan', '蕭燐洪', '台灣SoR無法黨')
minor('yeh-jen-wen', 'tainan', '葉人文', '無黨籍')

# ---------- 高雄
cand(id='ko-chih-en', region='kaohsiung', name='柯志恩', party='中國國民黨',
  photo=PHOTO('ko-chih-en'),
  slogan=it('夢想海港・世界雄心', V, 'udn-khh-visual', '2026-10-11'),
  subSlogans=[it('為高雄凸全世界', V, 'udn-khh-visual'), it('這柯不一樣（看板）', V, 'user-img'), it('新市長 新視野（看板）', V, 'user-img'), it('恩+1', U, 'user')],
  palette=['#2c6fd1', '#f2c230', '#e2452c', '#22a6a1'],
  visuals=[VIS('ko-billboard', '戶外看板', '藍黃大型看板「這柯不一樣 柯志恩／新市長 新視野」', U, 'user-img')],
  timeline=[it('交通五大政策上線官網', V, 'ko-site-traffic', '2026-09-22'), it('四色主視覺解析：科技藍、豐收黃、豔陽紅、海洋青', V, 'udn-khh-visual', '2026-10-11'),
            it('完整 AI 產業生態系與全民 AI 教育', V, 'cna-khh-ai', '2026-10-12')],
  analysis={
    'meaning': '「海港」接上高雄的港都身分，「雄心」嵌入「雄」字；「凸」是台語的「凸（tu̍h）」，有往前、伸出去的意思。四個顏色分別對應未來產業、農產、活力和海洋漁業。',
    'emotion': ['開闊', '企圖心', '樂觀'],
    'promise': '區域均衡（五區）、交通、AI 生態系，以及傳統產業升級。',
    'needs': ['傳產中小企業（導入 AI 與國際認證）', '原縣區的農漁業從業者（豐收黃、海洋青）', '有家庭照顧需求的人（喘息券）'],
    'cityLinks': [
      {'kind': '產業', 'text': 'AI 園區、無人機、飛控、空間資訊、全民 AI 教育', 'status': V, 'src': ['cna-khh-ai']},
      {'kind': '交通', 'text': '步行、自行車、大眾運輸、道路安全', 'status': V, 'src': ['ko-site-traffic']},
      {'kind': '區域', 'text': '團隊說明四色代表高雄 38 區的多元', 'status': V, 'src': ['udn-khh-visual']},
    ],
    'limits': '口號以願景為主，需要和九大政策、13579 藍圖的具體數字對照；「凸」是方言詞，跨族群解讀可能不同。',
  },
  pledges=[it('交通五大政策', V, 'ko-site-traffic', stage='政見'), it('AI 生態系與全民 AI 教育', V, 'cna-khh-ai', stage='政見'),
           it('傳產導入 AI、喘息券等社會安全網', V, 'bt-ko', stage='政見'), it('九大政策藍圖、涼感城市、13579 城市藍圖', U, 'user', stage='政見')],
  tactics=[{'ch': 'board', 'text': '四色看板「為高雄凸全世界」', 'status': V, 'src': ['udn-khh-visual']},
           {'ch': 'car', 'text': '密集掃市場、夜市', 'status': V, 'src': ['cna-lai-video']},
           {'ch': 'fb', 'text': '「恩+1」社群互動、闢謠與募款', 'status': U, 'src': ['user']}],
  identity=[it('國民黨提名高雄市長參選人；立法委員', V, 'cna-reg')],
)
cand(id='lai-jui-lung', region='kaohsiung', name='賴瑞隆', party='民主進步黨',
  photo=PHOTO('lai-jui-lung'),
  slogan=it('南方崛起、邁向國際', V, ['user-img', 'cna-lai-brand'], '2026-05-12'),
  subSlogans=[it('The Rising South, Kaohsiung for the World.（主視覺英文）', V, 'user-img'), it('隆捲風、隆興旺（支持者二創）', V, 'udn-khh-visual'),
              it('市長接棒、議會過半', U, 'user')],
  palette=['#e04a78', '#ffffff', '#f5c33b'],
  visuals=[VIS('lai-rising-south', '主視覺海報', '桃紅底人物海報「南方崛起 邁向國際」，搭配動態斜線', U, ['user-img', 'cna-lai-brand'])],
  timeline=[it('公布桃紅主視覺：旭日與動態斜線傳達新時代、突破與國際化', V, 'cna-lai-brand', '2026-05-12'),
            it('「百變隆隆」競選影片：一人分飾百工百業', V, 'cna-lai-video', '2026-10-01'),
            it('亞洲新灣區 AI 產業聚落：腹地、電力、人才', V, 'cna-khh-ai', '2026-10-12')],
  analysis={
    'meaning': '「崛起」把高雄放在「南方」對「北部」的發展對比裡，「邁向國際」接上半導體投資帶來的國際能見度；名字裡的「隆」則延伸出隆捲風、隆興旺等二創。',
    'emotion': ['上升', '年輕', '國際'],
    'promise': '接續半導體 S 廊帶，延伸成 AI 算力和人才中心。',
    'needs': ['半導體及供應鏈從業者', '希望留在南部發展的青年', '亞灣周邊的軟體與 IC 設計業者'],
    'cityLinks': [
      {'kind': '產業', 'text': '楠梓園區台積電晶圓 22 廠規劃 P1–P5（先進製程晶圓製造），和日月光等封裝測試聚落是不同環節', 'status': V, 'src': ['kcg-nanzi', 'kcg-s']},
      {'kind': '產業', 'text': 'AI 算力中心、半導體封測中心、國家級人才中心（使用者整理）', 'status': U, 'src': ['user']},
      {'kind': '行銷', 'text': '桃紅色統一用在看板、印刷與商品，年輕幕僚參與設計', 'status': V, 'src': ['udn-khh-visual']},
    ],
    'limits': '「崛起」的論述建立在既有執政成果上，選民的檢驗點會落在交通分流、居住成本等生活面向是否同步改善。',
  },
  pledges=[it('亞灣 AI 產業聚落', V, 'cna-khh-ai', stage='政見'), it('AI 算力中心、封測中心、高階人才中心', U, 'user', stage='政見')],
  tactics=[{'ch': 'yt', 'text': '「百變隆隆」16 角形象影片', 'status': V, 'src': ['cna-lai-video']},
           {'ch': 'ugc', 'text': '隆捲風、隆興旺等支持者二創周邊', 'status': V, 'src': ['udn-khh-visual']},
           {'ch': 'car', 'text': '搭配 11 個議員選區的陸空戰', 'status': V, 'src': ['cna-lai-video']}],
  identity=[it('民進黨提名高雄市長參選人；立法委員', V, 'cna-reg')],
)
minor('chang-ching', 'kaohsiung', '張靜', '司法改革黨', '政見主軸：陪審制、民選法官與檢察長')
minor('wang-chao-min', 'kaohsiung', '王肇民', '無黨籍')
minor('hung-fang-lung', 'kaohsiung', '洪方隆', '無黨籍')

# ---------- 屏東縣
cand(id='chou-chun-mi', region='pingtung', name='周春米', party='民主進步黨', incumbent=True,
  photo=PHOTO('chou-chun-mi'),
  slogan=it('希望城市、屏東亮起來', V, 'ct-chou', '2026-10-13'),
  subSlogans=[it('做事拚未來！屏東亮起來！（記者會主題）', V, 'ct-chou'), it('屏東向前、希望城市（2022 主軸）', V, 'ct-chou', '2022')],
  palette=['#e2457f', '#f6b93b', '#3a3a3a'],
  visuals=[VIS('chou-chun-mi-hq', '競總現場', '粉紅背板「希望城市 屏東亮起來」，現場展示太陽、晶片與米字圖形；這是活動現場，不是平面主視覺原檔', U, 'user-img')],
  timeline=[it('2022：「屏東向前、希望城市」', V, 'ct-chou', '2022'), it('公布 LOGO「屏東亮起來」：太陽＋晶片＋米字', V, 'ct-chou', '2026-10-13'),
            it('縣立體育館競總成立，和屏東市長參選人梁育慈一起向支持者報告', V, 'ct-chou', '2026-10-17')],
  analysis={
    'meaning': '「亮」同時指屏東的陽光、科技（晶片）和名字裡的「米」。從 2022 的「向前」升級到 2026 的「亮起來」，是現任者「成果已經可以看見」的語法。',
    'emotion': ['明亮', '熱情', '延續'],
    'promise': '把科技廊帶和農業升級一起推進：半導體 S 廊帶延伸、冷鏈與智慧農業。',
    'needs': ['擔心人口外流的家庭與青年', '農漁業者（冷鏈、智慧農業）', '高齡照顧需求'],
    'cityLinks': [
      {'kind': '人口', 'text': '屏東粗死亡率 13.11‰，全國第三高（115年9月），高齡化是城市條件', 'status': V, 'src': ['ris-11509']},
      {'kind': '產業', 'text': '半導體 S 廊帶、火箭場、冷鏈（使用者整理）', 'status': U, 'src': ['user']},
    ],
    'limits': '晶片意象是對科技招商的期待，實際進駐規模需要用園區數據來驗證。',
  },
  pledges=[it('半導體 S 廊帶延伸、火箭發射場', U, 'user', stage='政見'), it('冷鏈與智慧農業', U, 'user', stage='政見'), it('育兒與長照', U, 'user', stage='政見')],
  tactics=[{'ch': 'rally', 'text': '廟口開唱', 'status': U, 'src': ['user']}, {'ch': 'hq', 'text': '10/17 縣立體育館競總成立', 'status': V, 'src': ['ct-chou']}],
  identity=[it('現任屏東縣長，爭取連任', V, 'cna-reg')],
)
cand(id='su-ching-chuan', region='pingtung', name='蘇清泉', party='中國國民黨',
  photo=PHOTO('su-ching-chuan'),
  slogan=it('未見已核實的正式競選口號', M, 'cna-su-rally'),
  subSlogans=[it('屏東好未來（10/17 成立大會／音樂會活動名稱，非已核實口號）', U, 'user', '2026-10-17'),
              it('屏東大團結（造勢現場口號）', V, 'cna-su-rally', '2026-09-19'), it('讓花開1次（韓國瑜站台呼喊，見報導標題）', V, 'cna-su-rally')],
  palette=['#2f5fa7', '#ffffff'],
  timeline=[it('2022 敗選後聲請重新驗票', V, 'cna-su-2022', '2022-11-28'), it('潮州鎮造勢，鄭麗文主席站台', V, 'cna-su-rally', '2026-09-19'),
            it('17:00 屏東市光明街成立大會，韓國瑜站台', V, 'ct-chou', '2026-10-17')],
  analysis={
    'meaning': '目前沒有正式口號可以分析。現有訊息集中在「仁醫」形象和「屏東大團結」的動員語言，品牌的重心放在候選人的醫師身分。',
    'emotion': ['照顧', '團結'],
    'promise': '高齡和兒童福利（陣營已著手規劃，細節未公布）。',
    'needs': ['高齡長者（敬老、假牙補助：使用者整理）', '育兒家庭（0–6 歲醫療、營養午餐：使用者整理）'],
    'cityLinks': [{'kind': '年齡', 'text': '屏東高齡化指標（粗死亡率全國第三高），可以和醫療福利的訴求對照', 'status': V, 'src': ['ris-11509']}],
    'limits': '缺少正式口號和完整政見，不宜過度詮釋。',
  },
  pledges=[it('敬老卡與假牙補助', U, 'user', stage='政見'), it('0–6 歲醫療及營養午餐', U, 'user', stage='政見'), it('能源供應', U, 'user', stage='政見')],
  tactics=[{'ch': 'rally', 'text': '9/19 潮州造勢；10/17 成立大會', 'status': V, 'src': ['cna-su-rally', 'ct-chou']}],
  identity=[it('國民黨提名屏東縣長參選人；2022 年曾參選屏東縣長', V, ['cna-reg', 'cna-su-2022'])],
)

# ---------- 屏東市
cand(id='chou-chia-chi', region='pingtung-city', name='周佳琪', party='中國國民黨', incumbent=True,
  photo=PHOTO('chou-chia-chi'),
  slogan=it('安居樂業好生活', V, 'udn-ptc', '2026-09-04', note='登記時的施政目標說法'),
  palette=['#2f5fa7', '#9cc3e6'],
  timeline=[it('完成登記，9 成里長到場', V, 'udn-ptc', '2026-09-04')],
  analysis={
    'meaning': '「安居樂業」是一個很傳統的四字成語，承諾的是基本生活面向；「好生活」把成語落到日常。這是現任者「顧好基本盤」的基層治理語言。',
    'emotion': ['安心', '踏實'],
    'promise': '路燈、清淤、通學步道，以及長者和新生兒福利。',
    'needs': ['通學家庭', '65 歲以上長者', '新生兒家庭'],
    'cityLinks': [{'kind': '基礎建設', 'text': '12 校通學步道、智慧 LED 路燈（自稱每年省下千萬以上電費）、清淤 8 萬公尺以上', 'status': V, 'src': ['udn-ptc']}],
    'limits': '成果數字是候選人自己的說法，尚未對照市府決算。',
  },
  record=[it('12 校通學步道', V, 'udn-ptc'), it('智慧 LED 路燈，自稱每年省電費千萬元以上', V, 'udn-ptc'), it('排水清淤 8 萬公尺以上', V, 'udn-ptc'), it('提高重陽敬老金', V, 'udn-ptc')],
  pledges=[it('爭取 0–6 歲健保費補助、新生兒禮包', V, 'udn-ptc', stage='政見'), it('縣立游泳池、匹克球場、公園升級', V, 'udn-ptc', stage='政見'),
           it('萬年溪生態休閒廊道、遷葬計畫', V, 'udn-ptc', stage='政見')],
  tactics=[{'ch': 'rally', 'text': '基層組織動員：前立委、縣議員與 9 成里長陪同登記', 'status': V, 'src': ['udn-ptc']}],
  identity=[it('現任屏東市長，爭取連任', V, 'udn-ptc')],
)
cand(id='liang-yu-tzu', region='pingtung-city', name='梁育慈', party='民主進步黨',
  photo=PHOTO('liang-yu-tzu'),
  slogan=it('屏東市要做事，梁育慈會做事', U, 'user'),
  subSlogans=[it('會做事、肯打拚的團隊', V, 'nt-liang', '2026-06-19'), it('縣市同一隊，建設更到位', U, 'user'), it('最強母雞（議員形容）', V, 'nt-liang')],
  palette=['#2f8b57', '#e2457f'],
  timeline=[it('端午節建國市場掃街', V, 'nt-liang', '2026-06-19'), it('和周春米一起在縣競總成立大會向支持者報告', V, 'ct-chou', '2026-10-17')],
  analysis={
    'meaning': '「做事」重複出現，用來對比現任；「縣市同一隊」主打和縣長同黨可以讓預算、建設更順。這是地方次級行政區常見的垂直整合訴求。',
    'emotion': ['務實', '團隊'],
    'promise': '交通、環境、長照、青年與商圈發展。',
    'needs': ['商圈業者', '長照家庭', '青年'],
    'cityLinks': [{'kind': '團隊', 'text': '10/17 和縣長周春米同台', 'status': V, 'src': ['ct-chou']}],
    'limits': '主口號尚未找到原始文宣；「縣市同隊」的效果取決於縣長選舉結果。',
  },
  pledges=[it('交通、環境、長照、青年、商圈發展（方向，細節未公布）', V, 'nt-liang', stage='政見')],
  tactics=[{'ch': 'car', 'text': '市場掃街，議員、候選人聯合拜票', 'status': V, 'src': ['nt-liang']}, {'ch': 'ugc', 'text': '健康按摩梳話題', 'status': U, 'src': ['user']}],
  identity=[it('民進黨提名屏東市長參選人；曾任縣議員', V, 'nt-liang')],
)

# ------------------------------------------------------------------ regions
def dist(prefix):
    rows = []
    for line in open(os.path.join(HERE, 'districts_ris_114.csv'), encoding='utf-8'):
        k, v = line.strip().split(',')
        if k.startswith(prefix): rows.append({'name': k[len(prefix):], 'pop': int(v)})
    return rows

ERA = lambda y, cat, title, detail='', status=U, src='editorial': {'year': y, 'cat': cat, 'title': title, 'detail': detail, 'status': status, 'src': [src] if isinstance(src, str) else src}

R = [
 dict(id='taipei', name='臺北市', short='臺北', office='市長', county='63000', en='TAIPEI', tone='#1f6fd6',
  population={'value': 2439507, 'date': '2025-12', 'status': V, 'src': ['ris-048'], 'note': '12 區人口加總，與使用者提供的數字相符'},
  age={'date': '2026-09', 'status': V, 'src': ['ris-11509'], 'shares': {'0-14': None, '15-64': 63.52, '65+': 24.86},
       'note': '65+ 全國最高、15–64 全國最低；0–14 未公布，不自行推算'},
  facts=[it('性比例 88.86，全國最低', V, 'ris-11509', '2026-09')],
  needs=[{'id': 'housing', 'label': '居住負擔與都更'}, {'id': 'commute', 'label': '科技園區通勤'}, {'id': 'ai', 'label': 'AI 產業與北士科'}, {'id': 'youth', 'label': '青年生活成本'}, {'id': 'aging', 'label': '高齡照顧'}],
  matrix={'chiang-wan-an': {'ai': 'AI 教育白皮書 92 億／輝達總部延續', 'commute': '自駕巴士三階段、捷運六線齊發', 'housing': '松機遷移後土地重整（倡議）'},
          'shen-po-yang': {'commute': '內湖錯峰、電動小巴、共享機車 TPASS', 'youth': '城市青年基金、青年 AI 額度', 'ai': '北士科城市研究院', 'aging': 'HEART：Accompany（陪伴照顧）'}},
  eras=[ERA(1970, '交通', '中山高速公路全線通車（1978）', '臺北盆地納入南北高速路網'),
        ERA(1980, '商業', '信義計畫區開發', '東區、信義成為新的商業金融軸線'),
        ERA(1996, '交通', '捷運木柵線通車', '臺北捷運第一條路線，開啟軌道城市時代'),
        ERA(2000, '科技', '內湖科技園區、南港軟體園區成形', '辦公型科技園區聚集，後來衍生通勤壅塞'),
        ERA(2004, '觀光', '台北 101 完工', '城市天際線與國際觀光符號'),
        ERA(2017, '服務', '臺北世大運', '城市行銷與場館更新'),
        ERA(2024, '服務', '臺北市青年局成立', '', V, 'bnext-tpe'),
        ERA(2026, '科技', '輝達台灣總部北士科簽約', 'T17/T18 地上權 50 年', V, 'bnext-tpe')],
 ),
 dict(id='new-taipei', name='新北市', short='新北', office='市長', county='65000', en='NEW TAIPEI', tone='#e0763f',
  population={'value': 4044831, 'date': '2025-12', 'status': V, 'src': ['ris-048'], 'note': '29 區加總；使用者提供 2026/09 為 4,034,572（待覆核）'},
  age={'status': M, 'note': '尚未取得新北市年齡結構官方表；不以全國比例代替'},
  facts=[it('戶數 1,804,655 戶，占全國 18.16%', V, 'ris-11509', '2026-09'), it('性比例 94.00，全國最低三名之一', V, 'ris-11509', '2026-09')],
  needs=[{'id': 'commute', 'label': '雙北跨區通勤'}, {'id': 'newtown', 'label': '新市鎮機能（淡海、林口）'}, {'id': 'care', 'label': '育兒與長照'}, {'id': 'renewal', 'label': '都市更新'}, {'id': 'identity', 'label': '城市主體性'}],
  matrix={'li-szu-chuan': {'commute': '雙北 30 分鐘生活圈', 'newtown': '淡海科學城', 'renewal': '居住新五箭'},
          'su-chiao-hui': {'care': '青年育兒宅、托育長照', 'identity': '新北城市主體性、板橋科技園區', 'newtown': '新皇冠觀光'}},
  eras=[ERA(1970, '產業', '三重、新莊、五股、土城工業聚落', '加工製造帶動人口移入衛星城'),
        ERA(1998, '交通', '捷運中和線、新店線通車（1998–1999）', '軌道把雙北通勤圈正式連起來'),
        ERA(2010, '建設', '臺北縣升格新北市（2010/12/25）'),
        ERA(2017, '交通', '桃園機場捷運通車，經過林口、泰山'),
        ERA(2018, '交通', '淡海輕軌通車'),
        ERA(2020, '交通', '捷運環狀線第一階段通車', '新北內部的橫向連結')],
 ),
 dict(id='taoyuan', name='桃園市', short='桃園', office='市長', county='68000', en='TAOYUAN', tone='#3a8f6a',
  population={'value': 2355106, 'date': '2025-12', 'status': V, 'src': ['ris-048'], 'note': '13 區加總；使用者提供 2026/08 為 2,357,912（待覆核）'},
  age={'status': M, 'note': '尚未取得桃園市年齡結構官方表'},
  migration=[it('人口年增率 0.25%，全國第二高', V, 'ris-11509', '2026-09'), it('9 月淨遷入 1,060 人，全國最多', V, 'ris-11509', '2026-09'), it('原住民人口 92,202 人', V, 'ris-11509', '2026-09')],
  needs=[{'id': 'rail', 'label': '軌道建設進度'}, {'id': 'housing', 'label': '移入人口的住宅'}, {'id': 'tech', 'label': '科技製造與就業'}, {'id': 'health', 'label': '醫療資源'}, {'id': 'school', 'label': '通學安全'}],
  matrix={'chang-shan-cheng': {'housing': '可負擔住宅 A20/A21', 'rail': '捷運綠線', 'school': '通學廊道'},
          'huang-shih-chieh': {'rail': '橘線延伸、公車三層級', 'tech': '桃竹苗大矽谷、龍潭三期', 'health': '第二醫學中心、醫護安居'}},
  eras=[ERA(1970, '產業', '中壢、龜山、觀音等工業區設立', '製造業與外來勞動人口移入'),
        ERA(1979, '交通', '中正國際機場（今桃園國際機場）啟用'),
        ERA(2007, '交通', '高鐵桃園站（青埔）啟用'),
        ERA(2014, '建設', '桃園縣升格桃園市（2014/12/25）'),
        ERA(2017, '交通', '桃園機場捷運通車'),
        ERA(2026, '交通', '捷運綠線延伸中壢段流標 9 次、預算增至 255 億元（對手陣營指稱）', '', V, 'udn-huang')],
 ),
 dict(id='taichung', name='臺中市', short='臺中', office='市長', county='66000', en='TAICHUNG', tone='#7b55b5',
  population={'value': 2868465, 'date': '2025-12', 'status': V, 'src': ['ris-048'], 'note': '29 區加總，與使用者提供的數字相符'},
  age={'status': M, 'note': '尚未取得臺中市年齡結構官方表'},
  facts=[it('戶數 1,184,163 戶，占全國 11.91%', V, 'ris-11509', '2026-09'), it('9 月淨遷入 305 人，全國第三', V, 'ris-11509', '2026-09')],
  needs=[{'id': 'traffic', 'label': '交通瓶頸'}, {'id': 'air', 'label': '空氣品質（中火）'}, {'id': 'mfg', 'label': '精密機械轉型'}, {'id': 'wage', 'label': '薪資與人才'}, {'id': 'balance', 'label': '山海屯城鄉均衡'}],
  matrix={'chiang-chi-chen': {'mfg': '台中智造：機器人、智慧製造園區', 'wage': '引入國際資源、提高薪資', 'traffic': '20 項交通政見'},
          'ho-hsin-chun': {'air': '中火以氣換煤', 'balance': '山線三三三、屯區海線身分', 'traffic': '西屯新政：捷運、會展、交通'}},
  eras=[ERA(1976, '交通', '臺中港啟用'),
        ERA(1980, '產業', '大里、太平、台中工業區的工具機與精密機械聚落'),
        ERA(1990, '商業', '七期重劃區開發'),
        ERA(2003, '科技', '中部科學園區設立'),
        ERA(2010, '建設', '臺中縣市合併升格'),
        ERA(2021, '交通', '捷運綠線通車')],
 ),
 dict(id='tainan', name='臺南市', short='臺南', office='市長', county='67000', en='TAINAN', tone='#c8573a',
  population={'value': 1852477, 'date': '2025-12', 'status': V, 'src': ['ris-048'], 'note': '37 區加總；使用者提供 2026/09 為 1,845,313（待覆核）'},
  age={'status': M, 'note': '尚未取得臺南市年齡結構官方表'},
  facts=[it('粗出生率 2.99‰，全國倒數第二', V, 'ris-11509', '2026-09')],
  needs=[{'id': 'transit', 'label': '城鄉交通'}, {'id': 'birth', 'label': '少子化與育兒'}, {'id': 'flood', 'label': '水患韌性'}, {'id': 'tourism', 'label': '古都觀光分散'}, {'id': 'tech', 'label': '南科外溢'}],
  matrix={'hsieh-lung-chieh': {'birth': '成長津貼 0–15 歲每月 5,000 元'},
          'chen-ting-fei': {'transit': '交通七彩行', 'tourism': '五大觀光軸'}},
  eras=[ERA(1970, '產業', '農業與古都商業', '原臺南縣為農漁大縣'),
        ERA(1996, '科技', '南部科學園區設立（1990 年代中後期）'),
        ERA(2010, '建設', '臺南縣市合併升格'),
        ERA(2018, '服務', '0823 豪雨水災', '水患韌性成為城市議題'),
        ERA(2020, '科技', '南科先進製程晶圓廠擴張'),
        ERA(2024, '觀光', '臺南 400 年（1624–2024）城市紀念')],
 ),
 dict(id='kaohsiung', name='高雄市', short='高雄', office='市長', county='64000', en='KAOHSIUNG', tone='#e04a78',
  population={'value': 2718545, 'date': '2025-12', 'status': V, 'src': ['ris-048'], 'note': '38 區加總；使用者提供 2026/07 為 2,708,485（待覆核）'},
  age={'status': M, 'note': '尚未取得高雄市年齡結構官方表'},
  facts=[it('戶數 1,217,912 戶，占全國 12.25%', V, 'ris-11509', '2026-09')],
  zones=[{'name': '楠梓產業園區', 'role': '先進晶圓製造', 'detail': '台積電晶圓 22 廠規劃 P1–P5；園區 182.57 公頃、聯外交通 155.91 億元', 'status': V, 'src': ['kcg-nanzi']},
         {'name': '楠梓科技產業園區（原加工區）', 'role': '封裝測試', 'detail': '日月光等封測聚落，和晶圓製造是不同環節', 'status': U, 'src': ['user']},
         {'name': '路竹高雄園區', 'role': '材料與設備', 'detail': '半導體先進材料、設備供應鏈', 'status': V, 'src': ['kcg-s']},
         {'name': '橋頭科學園區', 'role': '智慧機械與跨域', 'detail': '精準健康、智慧機械、電動車關聯', 'status': V, 'src': ['kcg-s']},
         {'name': '亞洲新灣區', 'role': 'IC 設計與 AIoT', 'detail': 'IC 設計、5G AIoT、軟體服務', 'status': V, 'src': ['kcg-s']}],
  needs=[{'id': 'chip', 'label': '半導體廊帶配套'}, {'id': 'youth', 'label': '青年留才'}, {'id': 'traffic', 'label': '園區交通分流'}, {'id': 'legacy', 'label': '傳產升級'}, {'id': 'balance', 'label': '原縣區均衡'}],
  matrix={'ko-chih-en': {'legacy': '傳產導入 AI 與國際認證', 'traffic': '交通五大政策', 'balance': '五區均衡、四色代表 38 區', 'chip': 'AI 生態系、無人機'},
          'lai-jui-lung': {'chip': '亞灣 AI 聚落、算力中心', 'youth': '高階人才中心'}},
  eras=[ERA(1970, '產業', '中鋼、中船、林園石化等重化工業', '前鎮加工出口區（1966）帶動港都工業化'),
        ERA(2008, '交通', '高雄捷運通車'),
        ERA(2009, '觀光', '高雄世界運動會'),
        ERA(2010, '建設', '高雄縣市合併'),
        ERA(2014, '建設', '前鎮、苓雅氣爆事故', '管線安全與城市治理的轉折'),
        ERA(2018, '服務', '衛武營國家藝術文化中心開幕'),
        ERA(2026, '科技', '楠梓台積電晶圓 22 廠：依市府資料 P1 已量產，P2–P5 規劃 2026–2027 陸續營運', '晶圓製造≠封測', V, 'kcg-nanzi')],
 ),
 dict(id='pingtung', name='屏東縣', short='屏東縣', office='縣長', county='10013', en='PINGTUNG', tone='#e2457f',
  population={'value': 782256, 'date': '2025-12', 'status': V, 'src': ['ris-048'], 'note': '33 鄉鎮市加總；使用者提供 2025/09 為 783,931'},
  age={'status': M, 'note': '尚未取得屏東縣年齡結構官方表'},
  facts=[it('粗死亡率 13.11‰，全國第三高', V, 'ris-11509', '2026-09'), it('粗結婚率 2.97‰，全國倒數第三', V, 'ris-11509', '2026-09')],
  needs=[{'id': 'outflow', 'label': '人口外流'}, {'id': 'agri', 'label': '農漁業升級'}, {'id': 'aging', 'label': '高齡醫療'}, {'id': 'tech', 'label': '科技招商'}, {'id': 'care', 'label': '育兒'}],
  matrix={'chou-chun-mi': {'tech': '半導體 S 廊帶延伸', 'agri': '冷鏈、智慧農業', 'care': '育兒三部曲', 'aging': '長照'},
          'su-ching-chuan': {'aging': '敬老卡、假牙補助', 'care': '0–6 歲醫療、營養午餐'}},
  eras=[ERA(1970, '產業', '農漁業為主、人口外流到高雄與北部'),
        ERA(1984, '觀光', '墾丁國家公園成立'),
        ERA(2000, '科技', '屏東農業生物技術園區（2000 年代）'),
        ERA(2020, '交通', '南迴鐵路全線電氣化'),
        ERA(2023, '交通', '高鐵延伸屏東案推動（六塊厝）'),
        ERA(2026, '科技', '科技廊帶、太空發射場議題')],
 ),
 dict(id='pingtung-city', name='屏東市', short='屏東市', office='市長', county='10013', town='10013010', en='PINGTUNG CITY', tone='#d4892f', parent='pingtung',
  population={'value': 191466, 'date': '2025-12', 'status': V, 'src': ['ris-048'], 'note': '屏東縣轄市，人口包含在屏東縣內，不可以重複加總；使用者提供 2026/04 為 190,928'},
  age={'status': M, 'note': '尚未取得屏東市年齡結構'},
  occupationNote='主計總處人力資源調查只發布到縣市層級；屏東市沒有市級職業結構調查',
  needs=[{'id': 'basic', 'label': '道路、路燈、排水'}, {'id': 'space', 'label': '公共空間與運動設施'}, {'id': 'elder', 'label': '長者福利'}, {'id': 'biz', 'label': '商圈與青年'}, {'id': 'hsr', 'label': '高鐵配套'}],
  matrix={'chou-chia-chi': {'basic': 'LED 路燈、清淤、通學步道', 'space': '游泳池、匹克球場、萬年溪廊道', 'elder': '敬老金、65+ 健保費'},
          'liang-yu-tzu': {'biz': '商圈發展、青年', 'elder': '長照', 'basic': '交通與環境'}},
  eras=[ERA(1970, '服務', '縣治所在：行政、醫療、商業中心'),
        ERA(2015, '交通', '屏東市區鐵路高架化完工'),
        ERA(2018, '觀光', '勝利星村創意生活園區'),
        ERA(2023, '交通', '高鐵屏東站規劃（六塊厝）')],
 ),
]

# ------------------------------------------------------------------ labour (MOL table 2-3, 2025 annual average, 千人)
LABOR_SRC = {'src': ['mol-23'], 'status': V, 'year': 2025, 'unit': '千人'}
LABOR = {  # pop15, labour force, employed, unemployed, not in LF, LFPR %, unemployment %
 'taipei': (2163,1181,1141,40,982,54.6,3.4), 'new-taipei': (3580,2148,2076,72,1431,60.0,3.4), 'taoyuan': (2007,1242,1200,41,765,61.9,3.3),
 'taichung': (2469,1515,1463,52,954,61.4,3.4), 'tainan': (1626,997,963,34,629,61.3,3.4), 'kaohsiung': (2387,1397,1352,45,990,58.5,3.2),
 'pingtung': (687,414,401,14,273,60.3,3.3), 'national': (20238,12028,11626,403,8210,59.43,3.35)}
LABOR = {k: dict(zip(['pop15','lf','emp','unemp','nlf','lfpr','ur'], v)) for k, v in LABOR.items()}
OCC_GROUPS = [('mgr','主管及監督人員'),('pro','專業人員'),('tech','技術員及助理專業人員'),('clerk','事務支援人員'),('svc','服務及銷售工作人員'),('agri','農林漁牧業生產人員'),('craft','技藝、機械操作及基層勞力')]
OCC = {'taipei': {'year': 2025, 'total': 1141, 'status': V, 'src': ['tpe-occ'], 'partial': True,
                  'values': {'mgr': (100, 8.76), 'pro': (277, 24.28)},
                  'note': '臺北市統計年報表 35 的 PDF 只能可靠讀出前兩類；其餘五類待取得主計總處原表後補上'}}

# ------------------------------------------------------------------ development frontier (projects that create new needs)
FR = lambda name, stage, detail, status=U, src='user', kind='產業': {'name': name, 'stage': stage, 'detail': detail, 'kind': kind, 'status': status, 'src': [src] if isinstance(src, str) else src}
FRONTIER = {
 'taipei': [FR('北士科 輝達台灣總部', '建照申請中', 'T17/T18 地上權已簽約；7/15 申請建照，預計 2030 年進駐約 4,000 人', V, 'bnext-tpe'),
            FR('北士科臨時／永久變電所', '規劃中', '臨時變電所約 20 個月完工，永久所地下化', V, 'bnext-tpe', '能源'),
            FR('捷運六線齊發', '施工中', '多條捷運路線同時施工', V, 'bnext-tpe', '交通'),
            FR('自駕巴士沙盒', '試行中', '2026 動物園 → 2027 北士科 → 2028 擴大', V, 'bnext-tpe', '交通'),
            FR('松山機場遷移', '倡議', '約 300 公頃土地重整（候選人主張）', U, 'user', '土地')],
 'new-taipei': [FR('淡海新市鎮／科學城', '開發中', '新市鎮人口導入與產業用地', U, 'user', '土地'), FR('捷運環狀線', '部分通車', '第一階段 2020 通車，後續路段施工', U, 'editorial', '交通'),
                FR('林口新市鎮', '開發中', '機捷沿線住宅與產業', U, 'editorial', '土地')],
 'taoyuan': [FR('桃園航空城', '延宕中', '第三跑道等進度遭對手批評', V, 'udn-huang', '交通'), FR('捷運綠線', '施工中', '延伸中壢段流標 9 次、預算 97→255 億元（對手指稱）', V, 'udn-huang', '交通'),
             FR('龍潭科學園區三期', '候選人主張', '黃世杰政見', V, 'udn-huang'), FR('桃竹苗大矽谷', '中央政策', '科技廊帶串連', V, 'udn-huang')],
 'taichung': [FR('智慧製造／機器人園區', '候選人主張', '江啟臣「台中智造」', V, 'cna-tc'), FR('中部科學園區', '營運中', '2003 年設立', U, 'editorial'),
              FR('臺中火力發電廠', '營運中', '空品議題來源（何欣純主張以氣換煤）', U, 'user', '能源')],
 'tainan': [FR('南部科學園區先進製程', '營運中', '晶圓製造聚落擴張', U, 'editorial'), FR('臺南捷運藍線', '規劃施工', '陳亭妃主張再加深綠線、紅線', V, 'udn-chen-traffic', '交通'),
            FR('鐵路地下化', '施工中', '市區交通縫合', V, 'udn-chen-traffic', '交通')],
 'kaohsiung': [FR('楠梓 台積電晶圓 22 廠', 'P1 量產／P2–P5 陸續', '先進製程晶圓製造；園區 182.57 公頃', V, 'kcg-nanzi'), FR('半導體 S 廊帶', '推動中', '楠梓、路竹、橋頭、亞灣分工', V, 'kcg-s'),
               FR('亞灣 AI 產業聚落', '候選人主張', '賴瑞隆：腹地、電力、人才', V, 'cna-khh-ai'), FR('楠梓園區聯外交通', '規劃中', '155.91 億元', V, 'kcg-nanzi', '交通')],
 'pingtung': [FR('半導體 S 廊帶延伸', '候選人主張', '周春米政見', U, 'user'), FR('旭海短期火箭發射場', '規劃中', '太空產業', U, 'user', '科技'),
              FR('高鐵延伸屏東', '規劃中', '六塊厝站', U, 'editorial', '交通')],
 'pingtung-city': [FR('高鐵屏東站', '規劃中', '六塊厝，鄰近屏東市', U, 'editorial', '交通'), FR('勝利星村', '營運中', '眷村再生商圈', U, 'editorial', '觀光')],
}

# ------------------------------------------------------------------ needs: evidence (city data → need) + slogan keywords (need → slogan)
E = lambda t, st=V, *src: {'text': t, 'status': st, 'src': list(src)}
NEED_X = {
 'taipei': {'housing': (['土地重整','安居','安'], [E('戶籍人口 2,439,507，12 區中大安區最多（28.2 萬）', V, 'ris-048')]),
            'commute': (['順','交通','通勤'], [E('內湖、南港科技園區通勤，雙方都提出專門政見', V, 'bnext-tpe')]),
            'ai': (['AI','科技','輝達','安可'], [E('輝達總部 2030 年預計進駐約 4,000 人', V, 'bnext-tpe')]),
            'youth': (['青年','順'], [E('15–64 歲人口占 63.52%，全國最低', V, 'ris-11509'), E('勞參率 54.6%，七縣市最低', V, 'mol-23')]),
            'aging': (['安','照顧','陪伴'], [E('65 歲以上占 24.86%，全國最高', V, 'ris-11509')])},
 'new-taipei': {'commute': (['世界級','交通','30分鐘'], [E('勞動力 214.8 萬人，七縣市最多', V, 'mol-23')]),
                'newtown': (['創新局','淡海','林口'], [E('淡海、林口新市鎮開發中', U, 'editorial')]),
                'care': (['溫暖','照顧','慧'], [E('勞參率 60.0%', V, 'mol-23')]),
                'renewal': (['世界級','都更'], [E('板橋、新莊、中和、三重各區人口皆逾 38 萬', V, 'ris-048')]),
                'identity': (['新北','世界級','創新'], [E('戶籍人口 404 萬，全國最多', V, 'ris-048')])},
 'taoyuan': {'rail': (['動起來','前進'], [E('捷運綠線延伸段流標 9 次（對手陣營指稱）', V, 'udn-huang')]),
             'housing': (['善良','安居'], [E('人口年增 0.25%，全國第二；9 月淨遷入 1,060 人，全國最多', V, 'ris-11509')]),
             'tech': (['世界','矽谷','前進'], [E('勞參率 61.9%，七縣市最高', V, 'mol-23')]),
             'health': (['心','健康','醫'], [E('挑戰者提出第二醫學中心', V, 'udn-huang')]),
             'school': (['善良'], [E('人口持續移入', V, 'ris-11509')])},
 'taichung': {'traffic': (['旗艦','交通','Way'], [E('勞動力 151.5 萬人', V, 'mol-23')]),
              'air': (['生活','綠'], [E('中火位於市境，候選人提出以氣換煤', U, 'user')]),
              'mfg': (['智造','旗艦'], [E('工具機與精密機械聚落', U, 'editorial')]),
              'wage': (['旗艦','布局全球'], [E('就業者 146.3 萬人', V, 'mol-23')]),
              'balance': (['欣','屯區','海線'], [E('區人口差距大：北屯 31.7 萬、和平 1.0 萬', V, 'ris-048')])},
 'tainan': {'transit': (['七彩','路路相通'], [E('37 個行政區，人口最少的龍崎區 3,234 人', V, 'ris-048')]),
            'birth': (['5000','津貼','幸福'], [E('粗出生率 2.99‰，全國倒數第二', V, 'ris-11509')]),
            'flood': (['韌性'], [E('2018 年 0823 水災', U, 'editorial')]),
            'tourism': (['400','觀光'], [E('臺南 400 年城市紀年', U, 'editorial')]),
            'tech': (['南科','科技'], [E('南科先進製程擴張', U, 'editorial')])},
 'kaohsiung': {'chip': (['崛起','國際','雄心'], [E('楠梓台積電 22 廠 P1–P5', V, 'kcg-nanzi')]),
               'youth': (['崛起','國際'], [E('失業率 3.2%，七縣市最低', V, 'mol-23')]),
               'traffic': (['海港','交通'], [E('楠梓園區聯外交通 155.91 億元', V, 'kcg-nanzi')]),
               'legacy': (['凸','海港','傳產'], [E('鋼鐵石化港口產業轉型', U, 'editorial')]),
               'balance': (['世界','五區','38'], [E('38 區：鳳山 35.3 萬、茂林 1,846 人', V, 'ris-048')])},
 'pingtung': {'outflow': (['希望','亮起來'], [E('戶籍人口 78.2 萬', V, 'ris-048')]),
              'agri': (['亮','米'], [E('農漁業大縣', U, 'editorial')]),
              'aging': (['未來','仁醫'], [E('粗死亡率 13.11‰，全國第三高', V, 'ris-11509')]),
              'tech': (['晶片','亮起來'], [E('S 廊帶延伸（候選人主張）', U, 'user')]),
              'care': (['希望','未來'], [E('粗結婚率 2.97‰，全國倒數第三', V, 'ris-11509')])},
 'pingtung-city': {'basic': (['安居','做事'], [E('縣治人口 19.1 萬', V, 'ris-048')]),
                   'space': (['好生活'], [E('勝利星村等公共空間', U, 'editorial')]),
                   'elder': (['安居','長照'], [E('屏東縣粗死亡率全國第三高', V, 'ris-11509')]),
                   'biz': (['樂業','做事'], [E('縣治商業中心', U, 'editorial')]),
                   'hsr': (['建設','同一隊'], [E('高鐵屏東站規劃', U, 'editorial')])},
}

for r in R:
    prefix = {'taipei': '臺北市', 'new-taipei': '新北市', 'taoyuan': '桃園市', 'taichung': '臺中市', 'tainan': '臺南市', 'kaohsiung': '高雄市', 'pingtung': '屏東縣'}.get(r['id'])
    r['districts'] = dist(prefix) if prefix else []
    r['districtSrc'] = {'src': ['ris-048'], 'date': '2025-12', 'status': V} if prefix else None
    r.setdefault('occupation', {'status': M, 'note': r.pop('occupationNote', None) or '主計總處《人力資源調查》「就業者之職業－按縣市別」原表尚未匯入（主計總處網站拒絕自動擷取，需要人工下載）；不以全國比例或產業結構推算', 'src': ['dgbas-occ']})
    r['candidates'] = [c['id'] for c in C if c['region'] == r['id']]
    lab_key = 'pingtung' if r['id'] == 'pingtung-city' else r['id']
    r['labor'] = dict(LABOR[lab_key], **LABOR_SRC, scope=('屏東縣（屏東市沒有市級調查）' if r['id']=='pingtung-city' else r['name']))
    if r['id'] in OCC: r['occupation'] = OCC[r['id']]
    r['frontier'] = FRONTIER.get(r['id'], [])
    for n in r['needs']:
        kw, ev = NEED_X[r['id']][n['id']]
        n['keywords'] = kw; n['evidence'] = ev

# ------------------------------------------------------------------ polls
P = []
def poll(**k):
    k.setdefault('status', U); k.setdefault('undecided', None); k.setdefault('notes', '')
    P.append(k)
# mode: phone | online-panel | opt-in ; question: vote | win | favor | debate | approval | aware
poll(id='tvbs-tpe-1007', region='taipei', pollster='TVBS民調中心', commissioner='未標註', start='2026-10-03', end='2026-10-07', mode='phone', method='市話人員訪問（後四碼隨機）', sample=1120, margin=2.9,
     question='vote', results={'chiang-wan-an': 49, 'shen-po-yang': 41}, undecided=11, status=V, src=['bt-tvbs-tpe'], notes='5 月底差距 28 點，10 月差距 8 點（同一機構前後比較）')
poll(id='tvbs-tpe-debate', region='taipei', pollster='TVBS民調中心', commissioner='未標註', start='2026-10-12', end='2026-10-15', mode='phone', method='電話訪問', sample=1131, margin=2.9,
     question='debate', results={'shen-po-yang': 41, 'chiang-wan-an': 30}, src=['user'], notes='辯論表現看好度，不是投票支持度')
poll(id='xinmin-ntpc', region='new-taipei', pollster='必肯市調（戴立安設計）', commissioner='信民兩岸研究協會', start='2026-10-06', end='2026-10-08', mode='phone', method='市話 750＋手機 323', sample=1073, margin=3.0,
     question='vote', results={'su-chiao-hui': 43.1, 'li-szu-chuan': 30.0}, status=V, src=['cna-ntpc-poll', 'user'], notes='支持度數字經中央社核對；日期、樣本與方法由使用者提供')
poll(id='xinmin-ntpc-win', region='new-taipei', pollster='必肯市調（戴立安設計）', commissioner='信民兩岸研究協會', start='2026-10-06', end='2026-10-08', mode='phone', method='市話＋手機', sample=1073, margin=3.0,
     question='win', results={'su-chiao-hui': 34.8, 'li-szu-chuan': 32.8}, src=['user'])
poll(id='pearson-ntpc', region='new-taipei', pollster='皮爾森數據', commissioner='鉅聞天下', start='2026-09-28', end='2026-10-03', mode='online-panel', method='網路問卷', sample=1066, margin=None,
     question='vote', results={'li-szu-chuan': 45.74, 'su-chiao-hui': 45.18}, src=['user'], notes='非機率抽樣，不能和電話民調連成趨勢')
poll(id='ntpt-ty', region='taoyuan', pollster='新台灣國策智庫', commissioner='凱達格蘭基金會出資', start='2026-09-15', end='2026-09-17', mode='phone', method='市話隨機抽樣', sample=1082, margin=2.98,
     question='vote', results={'chang-shan-cheng': 47.0, 'huang-shih-chieh': 25.9}, undecided=27.1, status=V, src=['ltn-ty-poll'])
poll(id='ntpt-ty-win', region='taoyuan', pollster='新台灣國策智庫', commissioner='凱達格蘭基金會出資', start='2026-09-15', end='2026-09-17', mode='phone', method='市話', sample=1082, margin=2.98,
     question='win', results={'chang-shan-cheng': 64.0, 'huang-shih-chieh': 16.4}, status=V, src=['ltn-ty-poll'])
poll(id='ntpt-ty-favor', region='taoyuan', pollster='新台灣國策智庫', commissioner='凱達格蘭基金會出資', start='2026-09-15', end='2026-09-17', mode='phone', method='市話', sample=1082, margin=2.98,
     question='favor', results={'chang-shan-cheng': 53.1, 'huang-shih-chieh': 30.3}, status=V, src=['ltn-ty-poll'], notes='不喜歡：張 23.6%、黃 20.1%')
poll(id='ntpt-ty-approval', region='taoyuan', pollster='新台灣國策智庫', commissioner='凱達格蘭基金會出資', start='2026-09-15', end='2026-09-17', mode='phone', method='市話', sample=1082, margin=2.98,
     question='approval', results={'chang-shan-cheng': 58.2}, status=V, src=['ltn-ty-poll'], notes='現任施政滿意度；不滿意 26.8%')
poll(id='shih-hsin-tc', region='taichung', pollster='世新大學民調中心', commissioner='國民黨臺中市議會黨團', start='2026-10-15', end='2026-10-16', mode='phone', method='電訪', sample=1070, margin=3.0,
     question='vote', results={'chiang-chi-chen': 39.8, 'ho-hsin-chun': 28.7}, src=['user'], notes='政黨委託')
poll(id='evidence-tc', region='taichung', pollster='循證民調', commissioner='臺中市信賴臺灣之友會', start='2026-10-05', end='2026-10-06', mode='phone', method='CATI 電訪', sample=1071, margin=2.99,
     question='vote', results={'chiang-chi-chen': 34.3, 'ho-hsin-chun': 32.4}, src=['user'], notes='政黨友好團體委託')
poll(id='era-tc', region='taichung', pollster='年代民調中心', commissioner='未標註', start='2026-10-02', end='2026-10-04', mode='phone', method='CATI 分層隨機', sample=1068, margin=3.0,
     question='vote', results={'chiang-chi-chen': 37.3, 'ho-hsin-chun': 31.3, 'hung-li-hua': 1.1}, undecided=29.7, status=V, src=['now-tc-poll'])
poll(id='era-tc-win', region='taichung', pollster='年代民調中心', commissioner='未標註', start='2026-10-02', end='2026-10-04', mode='phone', method='CATI', sample=1068, margin=3.0,
     question='win', results={'chiang-chi-chen': 41.7, 'ho-hsin-chun': 21.3}, undecided=37.0, status=V, src=['now-tc-poll'])
poll(id='era-tc-favor', region='taichung', pollster='年代民調中心', commissioner='未標註', start='2026-10-02', end='2026-10-04', mode='phone', method='CATI', sample=1068, margin=3.0,
     question='favor', results={'ho-hsin-chun': 86.0, 'chiang-chi-chen': 76.2}, status=V, src=['now-tc-poll'], notes='「欣賞」比例，題目口徑和投票支持不同')
poll(id='tvbs-tn', region='tainan', pollster='TVBS民調中心', commissioner='未標註', start='2026-03-09', end='2026-03-12', mode='phone', method='市話人員訪問', sample=1052, margin=3.0,
     question='vote', results={'chen-ting-fei': 53, 'hsieh-lung-chieh': 30}, src=['user'], notes='3 月資料，不是 10 月最新')
poll(id='pearson-tn', region='tainan', pollster='皮爾森數據', commissioner='鉅聞天下', start='2026-02-23', end='2026-02-28', mode='online-panel', method='網路問卷', sample=1580, margin=None,
     question='vote', results={'chen-ting-fei': 45.96, 'hsieh-lung-chieh': 40.57}, src=['user'], notes='2 月資料；網路問卷')
poll(id='ettoday-khh', region='kaohsiung', pollster='ETtoday民調雲', commissioner='ETtoday', start='2026-08-22', end='2026-08-30', mode='online-panel', method='封閉式網路問卷', sample=1283, margin=None,
     question='vote', results={'ko-chih-en': 43.8, 'lai-jui-lung': 43.5}, src=['user'], notes='機構宣稱 ±2.74，但網路問卷不能套用機率抽樣誤差')
poll(id='pearson-khh', region='kaohsiung', pollster='皮爾森數據', commissioner='鉅聞天下', start='2026-07-27', end='2026-08-01', mode='online-panel', method='網路問卷', sample=1608, margin=None,
     question='vote', results={'lai-jui-lung': 47.78, 'ko-chih-en': 46.14}, src=['user'])
poll(id='ntpt-khh', region='kaohsiung', pollster='新台灣國策智庫', commissioner='未標註（綠營智庫）', start='2026-06-09', end='2026-06-10', mode='phone', method='市話', sample=1094, margin=2.96,
     question='vote', results={'lai-jui-lung': 46.2, 'ko-chih-en': 28.4}, src=['user'], notes='6 月資料')
OPTIN = {'source': '壹蘋新聞網自願參與網路投票', 'dates': '2026-10-12/10-16', 'status': U, 'src': ['user'],
         'warning': '自願參與的網路投票，不具統計代表性，不能用來預測選情；只放在附錄，不進入任何主圖表。',
         'results': [
           {'region': 'taipei', 'n': 5045, 'r': {'shen-po-yang': 56.15, 'chiang-wan-an': 41.47}},
           {'region': 'new-taipei', 'n': 4271, 'r': {'su-chiao-hui': 53.22, 'li-szu-chuan': 44.91}},
           {'region': 'taoyuan', 'n': 4121, 'r': {'huang-shih-chieh': 50.79, 'chang-shan-cheng': 47.08}},
           {'region': 'taichung', 'n': 4189, 'r': {'ho-hsin-chun': 53.26, 'chiang-chi-chen': 44.95}},
           {'region': 'tainan', 'n': 26786, 'r': {'chen-ting-fei': 92.55, 'hsieh-lung-chieh': 7.22}},
           {'region': 'kaohsiung', 'n': 9811, 'r': {'lai-jui-lung': 79.45, 'ko-chih-en': 19.64}}]}
POLL_GAPS = {'pingtung': '未找到公開的正式民調；不使用「五五波」等無數據描述', 'pingtung-city': '未找到公開的正式民調'}

# ------------------------------------------------------------------ events (dated, for timeline)
EV = []
for c in C:
    for t in c['timeline']:
        if t.get('date') and len(t['date']) >= 7:
            EV.append({'region': c['region'], 'cand': c['id'], 'date': t['date'], 'text': t['text'], 'status': t['status'], 'src': t.get('src', [])})
EV.sort(key=lambda e: e['date'])

CHANNELS = [
 ('fb', 'Facebook'), ('ig', 'Instagram'), ('threads', 'Threads'), ('yt', 'YouTube／影片'), ('podcast', 'Podcast'), ('line', 'LINE'),
 ('web', '官網'), ('news', '新聞／政論'), ('live', '直播'), ('rally', '造勢／掃街'), ('board', '看板'), ('car', '車掃'),
 ('hq', '競總'), ('merch', '小物'), ('ugc', '二創'), ('team', '團隊'),
]
QUESTION = {'vote': '投票支持度', 'win': '看好誰當選', 'favor': '好感／欣賞度', 'debate': '辯論表現看好', 'approval': '施政滿意度', 'aware': '知名度'}
MODE = {'phone': '電話調查（機率抽樣）', 'online-panel': '網路問卷（非機率樣本）', 'opt-in': '自願網路投票'}

db = {
 'meta': {'title': '2026 選戰切一刀', 'asOf': '2026-10-18', 'electionDay': '2026-11-28', 'electionSrc': ['cna-reg'],
          'built': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).strftime('%Y-%m-%d %H:%M +08'),
          'status': {V: '已核實：比對過具日期的原始報導、官方資料或陣營原圖', U: '未核實：使用者提供或編輯整理，尚待原文', M: '缺漏：查無可靠資料，不填推估值'},
          'neutrality': '本站呈現各陣營的行銷手法和公開資料，不替任何政黨或候選人宣傳；不從職業、年齡推定政治立場。口號解析是編輯詮釋，不是陣營說法。'},
 'sources': SOURCES, 'regions': R, 'candidates': C, 'polls': P, 'optIn': OPTIN, 'pollGaps': POLL_GAPS,
 'events': EV, 'laborAll': LABOR, 'laborSrc': LABOR_SRC, 'occGroups': [{'id':a,'label':b} for a,b in OCC_GROUPS], 'channels': [{'id': a, 'label': b} for a, b in CHANNELS], 'questionTypes': QUESTION, 'modes': MODE,
}
assert len(C) == 27, len(C)
for c in C:
    for f in ('photo',):
        if c[f]: assert os.path.exists(os.path.join(ROOT, c[f]['file'])), c[f]
    for v in c['visuals']: assert os.path.exists(os.path.join(ROOT, v['file'])), v['file']
def walk(x):
    if isinstance(x, dict):
        for s in x.get('src', []) if isinstance(x.get('src'), list) else []: assert s in SOURCES, s
        for v in x.values(): walk(v)
    elif isinstance(x, list):
        for v in x: walk(v)
walk(db)
os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
json.dump(db, open(os.path.join(ROOT, 'data', 'db.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('ok', len(C), 'candidates', len(P), 'polls', len(EV), 'events', os.path.getsize(os.path.join(ROOT, 'data', 'db.json')), 'bytes')
