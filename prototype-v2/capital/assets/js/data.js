/* 首都選戰洋流 — 資料檔
 * status: verified（已核實：本站讀過原始報導或官方資料）
 *         unverified（未核實：一般知識、單一轉述或使用者提供，待補原始出處）
 *         missing（缺漏：找不到可靠資料，不自行推估）
 * 所有數字只引用來源，不自行推算；推算值一律標示。 */
window.CC = {
asOf: '2026-10-19',
voteDay: '2026-11-28',

src: {
  'wiki-mayor': {t:'Mayor of Taipei（歷屆選舉結果表）', p:'Wikipedia', d:'2026-10', u:'https://en.wikipedia.org/wiki/Mayor_of_Taipei'},
  'wiki-1994': {t:'1994 Taiwanese local elections', p:'Wikipedia', d:'2026-10', u:'https://en.wikipedia.org/wiki/1994_Taiwanese_local_elections'},
  'nccu-2018': {t:'107年臺北市長選舉 各政黨得票（中選會資料）', p:'政大選舉研究中心', d:'2018-11', u:'https://vote.nccu.edu.tw/cec/D2018635.PDF'},
  'ris-048': {t:'鄉鎮市區人口密度 ODRP048（民國114年）', p:'內政部戶政司', d:'2025-12', u:'https://www.ris.gov.tw/rs-opendata/api/v1/datastore/ODRP048/114'},
  'ris-11509': {t:'民國115年9月戶口統計資料分析', p:'內政部戶政司', d:'2026-10-08', u:'https://www.ris.gov.tw/info-liferay/app/channel/newsDetail/26278263'},
  'bnext-tpe': {t:'台北市長科技政策比較：沈伯洋 vs 蔣萬安', p:'數位時代', d:'2026-10-06', u:'https://www.bnext.com.tw/article/92509/taipei-mayor-2026-shen-chiang-tech-policy'},
  'cna-chiang-hq': {t:'蔣萬安競辦成立 主視覺「台北安可」', p:'中央社', d:'2026-09-29', u:'https://www.cna.com.tw/news/aipl/202609290204.aspx'},
  'cna-shen-kv': {t:'沈伯洋公布主視覺「台北順起來 FUTURE SOON」', p:'中央社', d:'2026-08-04', u:'https://www.cna.com.tw/news/aloc/202608040069.aspx'},
  'cna-shen-merch': {t:'沈伯洋公布 8 款競選小物 奔奔、抱抱亮相', p:'中央社', d:'2026-08-25', u:'https://www.cna.com.tw/news/aloc/202608250080.aspx'},
  'cna-reg': {t:'2026 九合一 22 縣市長登記參選名單', p:'中央社', d:'2026-09-04', u:'https://www.cna.com.tw/news/aipl/202609045002.aspx'},
  'qs-tpe': {t:'台北市長社群聲量週報 10/05–10/11', p:'QSearch', d:'2026-10-12', u:'https://www.qsearch.cc/blog/2026/10/taipei-mayor-2026-social-volume-1005-1011/'},
  'bt-tvbs': {t:'TVBS 民調：蔣萬安 49%、沈伯洋 41%', p:'今周刊', d:'2026-10-08', u:'https://www.businesstoday.com.tw/article/category/183027/post/202610080048/'},
  'setn-crew1': {t:'「台北大洋流」上線不到一天 10 萬人登記船員', p:'三立（鏡週刊轉載）', d:'2026-10-01', u:'https://www.mirrormedia.mg/external/setn_1915955'},
  'setn-crew2': {t:'逾 16 萬「洋流船員」 沈伯洋競總明成立', p:'三立新聞網', d:'2026-10-03', u:'https://www.setn.com/ampnews/1916790'},
  'cna-hq': {t:'沈伯洋競總成立 盼溫暖「洋流」進北市府', p:'中央社', d:'2026-10-04', u:'https://cna.com.tw/news/aipl/202610040174.aspx'},
  'cna-sweep1': {t:'沈伯洋首啟「台北大洋流」車掃', p:'中央社', d:'2026-10-11', u:'https://cna.com.tw/news/aipl/202610110170.aspx'},
  'bt-sweep1': {t:'「台北大洋流號」車隊掃街 逾 2000 輛機車隨隊', p:'今周刊', d:'2026-10-12', u:'https://www.businesstoday.com.tw/article/category/183027/post/202610120005/'},
  'ltn-apology': {t:'「台北大洋流」航向松山信義 團隊先發「道歉啟事」', p:'自由時報', d:'2026-10-17', u:'https://news.ltn.com.tw/news/politics/breakingnews/5609342'},
  'et-sweep2': {t:'「大洋流」車掃禁跟車 小水滴「路跑」緊跟', p:'ETtoday', d:'2026-10-18', u:'https://www.ettoday.net/news/20261018/3256909.htm'},
  'et-rule': {t:'10/18「台北大洋流」改地點 拜託別跟車、放鞭炮', p:'ETtoday', d:'2026-10-13', u:'https://www.ettoday.net/news/20261013/3254059.htm'},
  'pts-shezi': {t:'沈伯洋提社子串聯北士科 蔣萬安回應', p:'公視新聞網', d:'2026-06-21', u:'https://news.pts.org.tw/article/814010'},
  'ltn-corridor': {t:'沈伯洋質疑科技廊帶「要串什麼」 蔣陣營：先做功課', p:'自由時報', d:'2026-10-14', u:'https://news.ltn.com.tw/news/politics/breakingnews/5606079'},
  'ltn-video': {t:'沈伯洋稱 AI 產業可視訊開會 雙北藍營批', p:'自由時報', d:'2026-10-16', u:'https://news.ltn.com.tw/news/politics/breakingnews/5608421'},
  'ltn-district': {t:'沈伯洋搬「創新街區」 蔣競辦：概念與 AI 廊帶相符', p:'自由時報', d:'2026-10-17', u:'https://news.ltn.com.tw/news/politics/breakingnews/5609359'},
  'ltn-grandma': {t:'社子島阿嬤淚崩求沈伯洋 蔣萬安回應', p:'自由時報', d:'2026-10-17', u:'https://news.ltn.com.tw/news/politics/breakingnews/5609503'},
  'cna-han': {t:'韓流對洋流？沈伯洋：立法院長針砭時事應無選舉意味', p:'中央社', d:'2026-10-12', u:'https://cna.com.tw/news/aipl/202610120119.aspx'},
  'twr-2018': {t:'2018 六都網路聲量分析', p:'報導者', d:'2018-11', u:'https://www.twreporter.org/i/2018-election-report-sharevoice-gcs'},
  'cna-nsb-2025': {t:'國安局揭中共認知戰 5 手法', p:'中央社（引國安局新聞稿）', d:'2026-01-11', u:'https://www.cna.com.tw/news/aipl/202601110031.aspx'},
  'cna-nsb-q1': {t:'國安局：政府網路首季遭駭 1.7 億次 疑中共鋪陳介選', p:'中央社（引國安局報告）', d:'2026-04-06', u:'https://www.cna.com.tw/news/aipl/202604060105.aspx'},
  'newtalk-tsa': {t:'台灣安保協會揭露中國介選新樣態', p:'新頭殼', d:'2026-05-02', u:'https://newtalk.tw/news/view/2026-05-02/1032966'},
  'dtl-2022': {t:'2022 台灣選舉：境外資訊影響觀測報告', p:'台灣民主實驗室', d:'2022-12-02', u:'https://medium.com/doublethinklab-tw/2022-%E5%8F%B0%E7%81%A3%E9%81%B8%E8%88%89%E5%A2%83%E5%A4%96%E8%B3%87%E8%A8%8A%E5%BD%B1%E9%9F%BF%E8%A7%80%E6%B8%AC%E5%A0%B1%E5%91%8A-879a4c470017'},
  'wiki-2026': {t:'2026 Taiwanese local elections', p:'Wikipedia', d:'2026-10', u:'https://en.wikipedia.org/wiki/2026_Taiwanese_local_elections'},
  'bt-cq': {t:'重慶公安對沈伯洋立案偵查', p:'今周刊（引新華社）', d:'2025-10-28', u:'https://www.businesstoday.com.tw/article/category/183027/post/202510280015/'},
  'udn-cctv': {t:'央視發布影片「起底」沈伯洋', p:'聯合新聞網', d:'2025-11-09', u:'https://udn.com/news/story/7331/9127389'},
  'yt-tvbs': {t:'沈伯洋抱病上場 再接受趙少康專訪｜LIVE', p:'少康戰情室 TVBS', d:'2026-10-13', u:'https://www.youtube.com/watch?v=AWM_j1P30kQ'},
  'yt-bcc': {t:'【老市民發問】專訪 台北市長候選人 沈伯洋', p:'中廣流行網 i like radio', d:'2026-09-10', u:'https://www.youtube.com/watch?v=ULWIruQR-Lc'},
  'yt-4d': {t:'S1EP80 市長你給我聽好了！沈伯洋專訪', p:'今晚找四端', d:'2026-10', u:'https://www.youtube.com/watch?v=zYtAGw_9Ee0'},
  'yt-ftv': {t:'洋流與韓流「風氣大不同」！康仁俊分析 2 大差異', p:'民視談天', d:'2026-10-15', u:'https://www.youtube.com/watch?v=iqq0RHoEREQ'},
  'yt-th': {t:'吸引 150 萬人，洋流氣勢為何擋不住？沈伯洋九個奇招', p:'唐浩說－世界的十字路口', d:'2026-10-13', u:'https://www.youtube.com/watch?v=2RrADnH1q4c'},
  'yt-yq': {t:'沈伯洋要跟蔣萬安拚台北，國民黨的優勢到底哪來的？', p:'一起看世界', d:'2026-10', u:'https://www.youtube.com/watch?v=Q_VlIx518Ck'},
  'user': {t:'使用者提供的資料或圖檔（原始出處待補）', p:'使用者', d:'2026-10', u:''},
  'user-img': {t:'使用者提供的競選視覺圖檔（陣營公開素材，授權與原始出處待確認）', p:'使用者', d:'2026-10', u:''},
  'general': {t:'一般公開知識，本站尚未逐筆附上原始出處', p:'編輯整理', d:'', u:''}
},

/* 陣營色只用來區分資料，與網站主色無關 */
camps: {
  kmt:{n:'國民黨', c:'#2f5fa7'}, dpp:{n:'民進黨', c:'#2f8b57'}, ind:{n:'無黨籍／白色力量', c:'#27a6b0'},
  np:{n:'新黨', c:'#e2b400'}, oth:{n:'其他', c:'#9a9188'}
},

elections: [
  {y:1994, turnout:78.53, valid:1408554, winner:'陳水扁', mayor:{name:'陳水扁', camp:'dpp', term:'1994–1998'},
   c:[['陳水扁','dpp',615090,43.67],['趙少康','np',424905,30.17],['黃大洲','kmt',364618,25.89],['紀榮治','oth',3941,0.28]],
   status:'verified', src:['wiki-1994','wiki-mayor'],
   tide:'首次市長民選。三強鼎立：新黨分走藍營票，陳水扁以 43.67% 當選。',
   gov:['捷運木柵線 1996 年通車（臺北捷運第一條路線）','掃除色情、取締電玩等市容治理','14、15 號公園預定地違建拆除（康樂里）爭議'],
   slogan:null},
  {y:1998, turnout:80.89, valid:1498901, winner:'馬英九', mayor:{name:'馬英九', camp:'kmt', term:'1998–2006'},
   c:[['馬英九','kmt',766377,51.13],['陳水扁','dpp',688072,45.91],['王建煊','np',44452,2.97]],
   status:'verified', src:['wiki-mayor'],
   tide:'藍營整合回流，投票率 80.89% 為歷屆最高。現任陳水扁滿意度高仍落選。',
   gov:['垃圾費隨袋徵收（2000 年起）','捷運路網持續擴建','2004 年台北 101 完工，天際線改變'],
   slogan:null},
  {y:2002, turnout:70.61, valid:1361913, winner:'馬英九', mayor:{name:'馬英九', camp:'kmt', term:'連任'},
   c:[['馬英九','kmt',873102,64.11],['李應元','dpp',488811,35.89]],
   status:'verified', src:['wiki-mayor'],
   tide:'現任優勢最大化：64.11% 是 1994 年以來台北市長最高得票率。',
   gov:['連任後推動市政延續','（施政細項待補原始出處）'],
   slogan:null},
  {y:2006, turnout:null, valid:1284549, winner:'郝龍斌', mayor:{name:'郝龍斌', camp:'kmt', term:'2006–2014'},
   c:[['郝龍斌','kmt',692085,53.81],['謝長廷','dpp',525869,40.89],['宋楚瑜','oth',53281,4.14],['李敖','oth',7795,0.61],['柯賜海','oth',3687,0.29],['周玉蔻','oth',1832,0.13]],
   status:'verified', src:['wiki-mayor'],
   tide:'有效票降到 128 萬，為歷屆最低；投票率此表未列。',
   gov:['2007 貓空纜車通車','2009 YouBike 試辦','2010 臺北國際花卉博覽會'],
   slogan:null},
  {y:2010, turnout:70.65, valid:1433736, winner:'郝龍斌', mayor:{name:'郝龍斌', camp:'kmt', term:'連任'},
   c:[['郝龍斌','kmt',797865,55.65],['蘇貞昌','dpp',628129,43.81],['其他 3 人','oth',7742,0.55]],
   status:'verified', src:['wiki-mayor'],
   tide:'五都升格同年，藍綠兩強對決，差距 16.98 萬票。',
   gov:['花博後場館再利用','（施政細項待補原始出處）'],
   slogan:null},
  {y:2014, turnout:70.46, valid:1494046, winner:'柯文哲', mayor:{name:'柯文哲', camp:'ind', term:'2014–2022'},
   c:[['柯文哲','ind',853983,57.16],['連勝文','kmt',609932,40.82],['其他 5 人','oth',30131,2.02]],
   status:'verified', src:['wiki-mayor'],
   tide:'第一道「新洋流」：無黨籍柯文哲在民進黨禮讓下勝選，網路動員與素人形象成為台北選戰新範式。',
   gov:['2017 臺北世界大學運動會','大巨蛋工程爭議與續建','公共住宅擴大興建'],
   slogan:null},
  {y:2018, turnout:65.33, valid:1414816, winner:'柯文哲', mayor:{name:'柯文哲', camp:'ind', term:'連任'},
   c:[['柯文哲','ind',580820,41.05],['丁守中','kmt',577566,40.82],['姚文智','dpp',244641,17.29],['其他 2 人','oth',11769,0.83]],
   status:'verified', src:['nccu-2018','wiki-mayor'],
   note:'丁守中、姚文智票數與中選會資料（政大選研中心整理）一致；柯文哲票數兩份資料有差異（580,820／580,663），以中選會為準，得票率由本站以有效票推算。',
   tide:'史上最近的一次：差距約 3,254 票。同年南部出現「韓流」。',
   gov:['北門廣場、西區門戶計畫','社會住宅持續興建','（施政細項待補原始出處）'],
   slogan:null},
  {y:2022, turnout:67.70, valid:1360951, winner:'蔣萬安', mayor:{name:'蔣萬安', camp:'kmt', term:'2022–'},
   c:[['蔣萬安','kmt',575590,42.29],['陳時中','dpp',434558,31.93],['黃珊珊','ind',342141,25.14],['其他','oth',8662,0.64]],
   status:'verified', src:['wiki-mayor'],
   tide:'再度三強：國民黨重返市府。民進黨候選人得票率 31.93%。',
   gov:['2023 大巨蛋啟用','2024 臺北市青年局成立','2026 輝達台灣總部北士科 T17/T18 地上權簽約'],
   gsrc:['bnext-tpe'],
   slogan:null}
],

city: {
  pop: {v:2439507, d:'2025-12', s:'verified', src:['ris-048']},
  old: {v:24.86, d:'2026-09', s:'verified', src:['ris-11509'], t:'65 歲以上人口占比，全國最高'},
  work: {v:63.52, d:'2026-09', s:'verified', src:['ris-11509'], t:'15–64 歲人口占比，全國最低'},
  districts: [['大安',282328],['內湖',267959],['士林',258163],['文山',253822],['北投',235678],['中山',212152],['信義',201446],['松山',187318],['萬華',168675],['中正',144109],['大同',116618],['南港',111239]]
},

duel: {
  chiang: {name:'蔣萬安', party:'國民黨', camp:'kmt', role:'現任市長・爭取連任', photo:'assets/img/chiang-wan-an.jpg', kv:'assets/img/chiang-taipei-encore.jpg',
    slogan:'台北安可', en:'Taipei Encore', sd:'2026-09-29', ssrc:['cna-chiang-hq'],
    read:'「安可」是觀眾要求返場的喝采：把連任包裝成市民主動要求再來一次。',
    pledges:['AI 教育白皮書：4 年 92 億元','首都科技廊帶：串聯北士科、內科、南軟、松山機場用地','自駕巴士三階段（2026 動物園 → 2027 北士科 → 2028 擴大）','社子島開發：防洪 200 年、先安置後拆遷'],
    psrc:['bnext-tpe','ltn-corridor','ltn-grandma']},
  shen: {name:'沈伯洋', party:'民進黨', camp:'dpp', role:'立法委員・挑戰者', photo:'assets/img/shen-po-yang.jpg', kv:'assets/img/shen-future-soon.jpg',
    slogan:'台北順起來', en:'FUTURE SOON', sd:'2026-08-04', ssrc:['cna-shen-kv'],
    read:'「順」把城市問題定義成「卡住」：通勤、辦事、生活成本，並和名字中的「洋」串成洋流語彙。',
    pledges:['北士科城市研究院：70–80 名博士級研究員','城市青年基金：18–22 歲每月 1,500 元','青年 AI 使用支持：兩階段共 9 億元','內湖交通：錯峰、電動小巴、共享機車納入 TPASS'],
    psrc:['bnext-tpe']},
  others: {names:['郭璽（台灣麻將最大黨）','蕭文乾（台灣SoR無法黨）','唐新民（三勢團結促進聯盟）','林志成（無黨籍）'], s:'verified', src:['cna-reg'], note:'皆已完成登記，未見正式競選口號'},
  poll: {who:'TVBS 民調中心', d:'2026-10-03～10-07', n:1120, moe:2.9, method:'市話人員訪問', r:{chiang:49, shen:41, und:11}, s:'verified', src:['bt-tvbs'], trend:'同機構 5 月底差距 28 點 → 10 月差距 8 點'},
  debate: {who:'TVBS 民調中心', d:'2026-10-12～10-15', r:{shen:41, chiang:30}, s:'unverified', src:['user'], note:'辯論表現看好度，不是投票支持度'},
  social: {period:'2026-10-05～10-11', s:'verified', src:['qs-tpe'],
    chiang:{m:31833, chg:28.7, sent:[12.0,30.2,57.8], fb:7, th:0},
    shen:{m:44846, chg:39.0, sent:[29.7,26.7,43.6], fb:33, th:32}},
  needs: [
    {k:'AI 產業與北士科', ev:'輝達總部 2030 年預計進駐約 4,000 人', chiang:'AI 教育白皮書 92 億／首都科技廊帶', shen:'北士科城市研究院／青年 AI 額度'},
    {k:'科技園區通勤', ev:'內湖、南港園區通勤，雙方都提專門政見', chiang:'自駕巴士、捷運六線齊發', shen:'錯峰上班、電動小巴、共享機車 TPASS'},
    {k:'青年生活成本', ev:'15–64 歲人口占比 63.52%，全國最低', chiang:'（本站尚未整理到對應政見）', shen:'城市青年基金'},
    {k:'高齡照顧', ev:'65 歲以上占 24.86%，全國最高', chiang:'（本站尚未整理到對應政見）', shen:'HEART 主軸中的 Accompany（陪伴照顧）'},
    {k:'居住與土地', ev:'社子島區段徵收程序進行中', chiang:'社子島開發、松山機場遷移倡議', shen:'質疑安置與回遷負擔；社子串聯北士科'}
  ]
},

/* 洋流專區 */
current: {
  diff: [
    {n:'01', t:'會員制入口', d:'加入官方 LINE 領「船員證」，再分派到「分區艦隊」。支持者先被數據化、再被分流到線下。', s:'verified', src:['setn-crew1','setn-crew2']},
    {n:'02', t:'路段認領＋燈號', d:'車掃前在 LINE 認領要站的路段，系統以灰（沒人）／綠（缺人）／橘（快滿）／紅（已滿）四色燈號調度人流。', s:'verified', src:['et-sweep2']},
    {n:'03', t:'禁跟車、禁鞭炮', d:'首場車掃出現塞車與鞭炮後，第二場改規則：不開放跟車、不放鞭炮，沿線迎接即可。', s:'verified', src:['et-sweep2','ltn-apology']},
    {n:'04', t:'先發「道歉啟事」', d:'車掃前派員到沿線社區發傳單，為聲響與人潮先向住戶致歉。把「擾民」這個傳統車掃最大的負評先處理掉。', s:'verified', src:['ltn-apology']},
    {n:'05', t:'掃街改成「開箱政見」', d:'車掃終點設「市政開講」，以「開箱秘寶」形式逐區公布政見（例：保安宮場針對中山、大同）。', s:'verified', src:['cna-sweep1']},
    {n:'06', t:'IP 化與手語「順」', d:'主視覺以手語手勢呈現「順」；周邊推出「奔奔」「抱抱」布偶；洋流系列出現漫畫風人物與海報。', s:'verified', src:['cna-shen-kv','cna-shen-merch']}
  ],
  flow: [
    {k:'LINE 船員證', v:'160,000+', sub:'10/3 下午，上線約 4 天', s:'verified', src:['setn-crew2']},
    {k:'分區艦隊', v:'6 選區', sub:'例：大安文山艦隊、中正萬華艦隊', s:'verified', src:['setn-crew1']},
    {k:'路段認領', v:'18,249', sub:'10/18 松信場，目標 12,888', s:'verified', src:['et-sweep2']},
    {k:'車掃現場', v:'2,000+ 輛', sub:'10/11 首場隨隊機車；直播同時 6 萬人', s:'verified', src:['bt-sweep1']},
    {k:'市政開講', v:'開箱政見', sub:'每區一場，終點即政見發表', s:'verified', src:['cna-sweep1']}
  ],
  growth: [
    {d:'09-30', v:0, t:'「台北大洋流」計畫啟動', src:['setn-crew2']},
    {d:'10-01', v:100000, t:'不到一天突破 10 萬', src:['setn-crew1']},
    {d:'10-03', v:160000, t:'逾 16 萬', src:['setn-crew2']}
  ],
  claim: {v:'13,455 → 18,249', t:'10/17 上午 → 10/18 傍晚截止的認領人數；網頁訪客約 6.2 萬、點擊逾 11 萬次（10/17）', src:['ltn-apology','et-sweep2']},
  timeline: [
    {d:'06-21', k:'policy', t:'提出社子串聯北士科', x:'社子親水設施老舊、照明不足，主張串成產業聚落；蔣萬安回應社子島已進入區段徵收程序。', src:['pts-shezi']},
    {d:'08-04', k:'brand', t:'主視覺「台北順起來 FUTURE SOON」', x:'橘色為主，兩個上揚箭頭交纏；以手語呈現「順」。', src:['cna-shen-kv']},
    {d:'08-25', k:'brand', t:'8 款競選小物', x:'「奔奔」「抱抱」布偶亮相。', src:['cna-shen-merch']},
    {d:'09-10', k:'media', t:'中廣《老市民發問》專訪', x:'以「老市民」為訴求的廣播節目。', src:['yt-bcc']},
    {d:'09-30', k:'mobil', t:'「台北大洋流」啟動、船員證上線', x:'加入 LINE 領船員證，分派分區艦隊。', src:['setn-crew2']},
    {d:'10-01', k:'mobil', t:'船員破 10 萬', x:'上線不到一天。', src:['setn-crew1']},
    {d:'10-04', k:'mobil', t:'競總成立', x:'主辦單位宣布逾 12 萬人到場；沈：「洋流怎麼會怕髒水」。', src:['cna-hq']},
    {d:'10-11', k:'mobil', t:'首場車掃：延平北路 → 保安宮', x:'逾 2,000 輛機車隨隊、直播同時 6 萬人；出現塞車與鞭炮。', src:['cna-sweep1','bt-sweep1']},
    {d:'10-12', k:'media', t:'「韓流對洋流」框架出現', x:'韓國瑜啟動輔選；沈回應「立法院長針砭時事應無選舉意味」。', src:['cna-han']},
    {d:'10-13', k:'media', t:'再上《少康戰情室》', x:'TVBS 趙少康主持的政論節目專訪（抱病上場）。', src:['yt-tvbs']},
    {d:'10-13', k:'policy', t:'質疑「首都科技廊帶」', x:'北大城市論壇：「到底要串什麼」、軟體公司開會「坐捷運或視訊也都 OK」。', src:['ltn-corridor']},
    {d:'10-14', k:'policy', t:'蔣陣營反擊', x:'發言人楊沛緰：「不懂 AI 產業發展，應該先做功課」。', src:['ltn-corridor']},
    {d:'10-16', k:'policy', t:'雙北藍營議員圍攻「視訊開會」', x:'並指蔡英文、賴清德、卓榮泰都提過廊帶政策。', src:['ltn-video']},
    {d:'10-17', k:'policy', t:'改提「創新街區」', x:'引 Innovation District 概念；蔣陣營稱「掉書袋」、與 AI 廊帶相符。', src:['ltn-district']},
    {d:'10-17', k:'policy', t:'社子島遶境 阿嬤跪地哭訴', x:'蔣萬安同日回應：防洪 200 年、先安置後拆遷、弱勢 24 年租金補貼。', src:['ltn-grandma']},
    {d:'10-17', k:'mobil', t:'松信場前發「道歉啟事」', x:'認領 13,455 人已超過目標 12,888。', src:['ltn-apology']},
    {d:'10-18', k:'mobil', t:'第二場車掃：五分埔 → 民權公園', x:'禁跟車、禁鞭炮；認領 18,249 人；支持者改「路跑」緊跟。', src:['et-sweep2']}
  ],
  tkind: {brand:['品牌',  '#111'], mobil:['動員', '#fff'], policy:['政策交鋒', '#33c3dd'], media:['媒體', '#ffd23f']},
  interviews: [
    {ch:'少康戰情室（TVBS）', d:'10/13', ring:3, fmt:'電視政論直播', who:'主持人趙少康', note:'題名寫「再接受」：至少第二次上同一節目。QSearch 10/5–11 顯示「少康戰情室專訪」是沈伯洋相關的 Facebook 熱議主題之一。', s:'verified', src:['yt-tvbs','qs-tpe']},
    {ch:'中廣流行網《老市民發問》', d:'9/10', ring:3, fmt:'廣播＋YouTube', who:'節目以「老市民」提問為形式', note:'觸及長期收聽廣播的年長市民。中廣與趙少康的經營關係屬一般公開資訊，本站尚未附原始出處。', s:'unverified', src:['yt-bcc','general']},
    {ch:'今晚找四端', d:'10月', ring:2, fmt:'網路訪談節目', who:'—', note:'題名沿用「市長你給我聽好了」，與陣營意見蒐集 APP 同名。', s:'verified', src:['yt-4d']},
    {ch:'民視談天《頭家來開講》', d:'10/15', ring:1, fmt:'電視政論（第三方評論）', who:'評論者康仁俊', note:'題目直接做「洋流 vs 韓流」比較。本站尚未取得逐字內容。', s:'verified', src:['yt-ftv']},
    {ch:'唐浩說－世界的十字路口', d:'10/13', ring:2, fmt:'YouTube 評論頻道（第三方）', who:'—', note:'題名稱「吸引 150 萬人」「九個奇招」；150 萬的計算方式未見說明，本站不採用此數字。', s:'unverified', src:['yt-th']},
    {ch:'一起看世界', d:'10月', ring:2, fmt:'YouTube 評論頻道（第三方）', who:'—', note:'從「國民黨的優勢到底哪來的」反向切入，屬分析對手結構的內容。', s:'verified', src:['yt-yq']}
  ],
  han: {
    same:[['網路聲量領先帶動話題','2018 韓國瑜聲量約為陳其邁 1.7 倍；2026 沈伯洋 10/5–11 聲量 44,846，高於蔣萬安 31,833','twr-2018 qs-tpe'],
          ['挑戰者姿態、一句話口號','「又老又窮」vs「台北順起來」：都把城市現況定義成需要被改變','general cna-shen-kv'],
          ['外界用「流」來命名現象','媒體與評論以「韓流對洋流」框架比較','cna-han yt-ftv']],
    han:[['情緒動員','以庶民語言、北漂與經濟焦慮帶出情緒'],['造勢大場','大型造勢晚會與跨縣市站台，聲量帶動同黨候選人'],['挑戰綠營長期執政的高雄','2018 高雄由國民黨勝選']],
    yang:[['數據化動員','LINE 船員證、分區艦隊、路段認領燈號，把熱度轉成可調度的人流'],['規則化現場','禁跟車、禁鞭炮、先發道歉啟事，回應擾民負評'],['挑戰現任的台北','現任蔣萬安爭取連任；民調仍領先 8 點（TVBS 10 月）']],
    s:'unverified', note:'2018 韓流特徵為一般政治分析，本站尚未逐條附原始出處；民視康仁俊的「2 大差異」逐字內容尚未取得。'
  },
  visuals: [
    {f:'assets/img/teaser.jpg', t:'準備啟航', d:'預告：動漫風人物、逆光、壓帽，只露出「台北大洋流」字標。', s:'unverified', src:['user-img']},
    {f:'assets/img/kv-current.jpg', t:'台北大洋流', d:'主視覺：橘白波浪、碼頭纜樁、台北天際線，FUTURE SOON 字帶。', s:'unverified', src:['user-img']},
    {f:'assets/img/ip-poster.jpg', t:'洋流 IP 海報', d:'漫畫人物持籃球，毛筆「洋流」；11/28、「洋流流向全臺灣」。', s:'unverified', src:['user-img']},
    {f:'assets/img/shen-future-soon.jpg', t:'台北順起來', d:'8/4 官方主視覺：橘色、雙箭頭、FUTURE SOON。', s:'verified', src:['cna-shen-kv','user-img']}
  ]
},

/* 暗流：認知作戰 */
ops: {
  grades: {A:'官方文件或多方來源可查（仍屬發布機關說法）', B:'研究機構報告或可信媒體的單一調查', C:'二手整理或單一來源，尚未取得原始文件'},
  items: [
    {g:'A', t:'2025 年全年：異常帳號 4.5 萬組、爭議訊息 231.4 萬則', who:'國家安全局', d:'2026-01-11', x:'5 大手法：數據蒐集社情、偽冒國際媒體與內容農場、逾 1 萬組自動化假帳號、AI 生成影音與語音、盜用 PTT 帳號。', src:['cna-nsb-2025']},
    {g:'A', t:'2026 年 1–3 月：異常帳號 1.3 萬組、爭議訊息 86 萬則', who:'國家安全局（立法院報告）', d:'2026-04-06', x:'列出年底選舉的介入手段：AI 深偽、假民調、地下賭盤、落地招待、團客觀光與農產品採購。', src:['cna-nsb-q1']},
    {g:'A', t:'政府網路首季遭侵擾約 1 億 7,328 萬次', who:'國家安全局', d:'2026-04-06', x:'國安局認為可能是為年底選舉預先布局情報蒐集。', src:['cna-nsb-q1']},
    {g:'A', t:'中國官方對沈伯洋的行動', who:'國台辦／重慶市公安局／央視', d:'2024-10 ～ 2025-11', x:'2024/10/14 國台辦列為「台獨頑固分子」並制裁黑熊學院；2025/10/28 重慶公安以「分裂國家」立案偵查；2025/11/9 央視播出「起底」影片，稱可跨境追捕。', src:['bt-cq','udn-cctv']},
    {g:'B', t:'介選新樣態：落地招待、小額付費、白手套', who:'台灣安保協會《中國威脅報告》', d:'2026-05-02', x:'以低價交流團接觸里長與地方意見領袖；國安案件定罪率不到七成（一般刑案約 96%）。', src:['newtalk-tsa']},
    {g:'B', t:'前例：2022 地方選舉記錄近 2,900 條可疑資訊', who:'台灣民主實驗室', d:'2022-12-02', x:'中國較少從零製造，多放大台灣既有爭議；台灣本地「共鳴者」是否轉傳，決定議題能否擴大。台北案例：故宮瓷器議題被微博大 V 帶上熱搜。', src:['dtl-2022']},
    {g:'C', t:'調查局偵辦 54 件疑似境外介選等案件；逾 200 筆異常金流', who:'Wikipedia 整理（截至 2026-09-08）', d:'2026-09', x:'本站尚未取得法務部或調查局原始公告，暫列 C 級。', src:['wiki-2026']}
  ],
  gap: '截至 2026-10-19，本站沒有找到公開、可查證的研究，指明有境外勢力針對本屆台北市長選戰進行特定操作。本站不把「有官方總量數據」推論成「某位候選人受害或受益」。',
  tips: ['先看來源：有沒有可點開的原始報告或官方公告','看數字的分母：全年、單季、單一平台不能直接比較','看「共鳴者」：可疑內容是被誰轉傳才擴大的','AI 影音：留意聲音與嘴型、截圖來源與首發時間']
}
};
