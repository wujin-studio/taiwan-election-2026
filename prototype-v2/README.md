# 2026 選戰切一刀（prototype-v2，V20）

從競選口號切入城市需求、選民結構、政策回應、視覺品牌、媒體布局與民調證據。靜態網站，不需要建置步驟；Render 從 GitHub 自動部署。

## 頁面
| 路徑 | 內容 |
|---|---|
| `index.html` | 首頁：真實縣市界 Three.js 立體地圖（含宜蘭；金門、連江不在畫面內）→ 行政區浮起、鏡頭聚焦 → 主口號滿版卡片 → 「切一刀」轉場。WebGL 不可用、`?lite=1` 或低記憶體裝置會降級為 SVG。右上「候選人比較」預設收合。 |
| `city.html?r=<id>` | 城市頁，7 個頁籤（以 `#hash` 切換，可以按上一頁）：行銷橫切面（第一欄）、候選人、城市年代、人口結構、媒體布局、民調與事件、橫向比較。 |
| `overview.html` | 27 人總表：一進頁面全部顯示，姓名＋政黨＋主口號同欄；全部民調表；自願網路投票附錄。 |
| `v19-index.html`、`v19-overview.html` | V19 舊版原封保留。 |

選區 id：`taipei new-taipei taoyuan taichung tainan kaohsiung pingtung pingtung-city`。屏東市使用國土測繪中心鄉鎮市區界（TOWNCODE 10013010），不是屏東縣全境。

## 資料
- 唯一資料來源：`data/db.json`，由 `tools/build_db.py` 產生（`python3 -I tools/build_db.py`）。總表、城市頁、候選人卡都讀這一份。
- 每筆資料都有 `status`：`verified`（比對過具日期的原始報導、官方資料或陣營原圖）／`unverified`（使用者提供或編輯整理）／`missing`（查無可靠資料，不填推估值）。
- 行政區人口：內政部戶政司 ODRP048（民國114年，2025 年底），存於 `tools/districts_ris_114.csv`。臺北、臺中加總與使用者提供的數字完全相符。
- 邊界：`taiwan-counties.topo.json`（縣市）；`data/geo/*.geojson`（鄉鎮市區，dkaoster/taiwan-atlas，MIT，源自國土測繪中心）。
- 圖片：`assets/img/`；出處與授權狀態見 `data/images-index.json`。所有人物都經過目視比對，不依檔名判斷。

## 已知缺漏（不推估）
- **職業結構**：主計總處「就業者之職業－按縣市別」原表尚未匯入（stat.gov.tw 拒絕自動擷取，需要人工下載）。屏東市沒有市級調查。
- **年齡結構**：只有臺北（65+ 24.86%、15–64 63.52%，115年9月）；其他縣市待匯入戶政司五歲年齡組。
- **社群數據**：只有臺北、新北的 QSearch 週報（10/5–11）；粉絲數、互動率、觸及尚未取得官方帳號數據。
- **肖像缺漏**：蔣萬安、蘇巧慧、江啟臣、何欣純、陳亭妃，以及 11 位小黨／無黨籍參選人。
- **主視覺原圖缺漏**：李四川、張善政、黃世杰、江啟臣、蘇清泉、周佳琪、梁育慈。
- **屏東縣、屏東市民調**：未找到公開正式民調。
- 圖片的原始網址與使用授權全部待確認。

## 回滾
- V19 對應 commit `3f04c4a`（tag `backup-v19-before-cut`）。
- 回滾：`git revert <V20 commit>` 後推上 main，或在 Render 後台選 V19 的 deploy 做 Rollback。
