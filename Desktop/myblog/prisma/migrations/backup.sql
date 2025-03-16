-- MariaDB dump 10.19  Distrib 10.11.6-MariaDB, for Linux (x86_64)
--
-- Host: service-67abef1929623f86cfa52e75    Database: zeabur
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `zeabur`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `zeabur` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `zeabur`;

--
-- Table structure for table `Account`
--

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Account` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerAccountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` text COLLATE utf8mb4_unicode_ci,
  `access_token` text COLLATE utf8mb4_unicode_ci,
  `expires_at` int DEFAULT NULL,
  `token_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_token` text COLLATE utf8mb4_unicode_ci,
  `session_state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Account_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  KEY `Account_userId_fkey` (`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account`
--

LOCK TABLES `Account` WRITE;
/*!40000 ALTER TABLE `Account` DISABLE KEYS */;
INSERT INTO `Account` VALUES
('cm71zr4ru00010s0kk8k8i71x',2,'oauth','google','106626132730219218056',NULL,'ya29.a0AXeO80T4zXsoH6wdAFn_NRBlbE4iGVzYGuKyE9bDJOp31hZQgdyfV4PaSqKsHgJKyWy7VtktE5XnYR2KPgUHTtg1rGwmGlHe_orPJa_EcNEWGQQPNVsqcLspQ6Nsh4H7gXjcN6ll21_Bpuvc6qwouzdefnLoDx52n9gA1B-bDwaCgYKAUsSARESFQHGX2MiV4AnqbLamBSbGXgGXkK38A0177',1739373203,'Bearer','openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile','eyJhbGciOiJSUzI1NiIsImtpZCI6ImVlYzUzNGZhNWI4Y2FjYTIwMWNhOGQwZmY5NmI1NGM1NjIyMTBkMWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NzI0NTIwNTIyMDEtbGI3aDZkMDhmcDFrZm5hNGNta2MyNDMzc2Z2OG9tcjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NzI0NTIwNTIyMDEtbGI3aDZkMDhmcDFrZm5hNGNta2MyNDMzc2Z2OG9tcjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDY2MjYxMzI3MzAyMTkyMTgwNTYiLCJlbWFpbCI6ImFiY2QzMDM3OEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IklmUlRSaE5XMjBqMXp4d0x5T0YzZnciLCJuYW1lIjoi5qWK5b-16IqdIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0szR2ZQQUpGNWFBZHFXdDJGRzhIeTdTb2E3eEZseTZuSmhqbUV2Ty1kVzFWazFiZGc9czk2LWMiLCJnaXZlbl9uYW1lIjoi5b-16IqdIiwiZmFtaWx5X25hbWUiOiLmpYoiLCJpYXQiOjE3MzkzNjk2MDQsImV4cCI6MTczOTM3MzIwNH0.ceHE_u-nZC1DDrKZ0raK-ni04ArnB4nPk1TfkQtw7LRy2KjRW7get6R43RESAVx8jsnF0e-oTF-F4X81GkyZBrPgVg2mst67u0Uzh9IYB3qjw9Yukbo11TYa4ciArkhI6ADkvObTBbV63KsbEKGhNFR0jRa8pwuUNpeujhzr0p4LytXL6ST2JQ_a8H-lLSa7fXJsVUtGgU04oUG6MDy8_m5NTQA7-_h5UEI4ZkRP_rs1UlEKXmzQq2v1bRCatHHJKriLynXtuDAaxwQZviqY3THMO-boxAY9WRVyT9f4KJIQ8GdXqc5xOFV7Jkj91GUe1y0FWY7TQtYDZPliFLTfrQ',NULL),
('cm7332r650001090kenu2n511',3,'oauth','google','107294215778293995233',NULL,'ya29.a0AXeO80R6TJQxFZzLQmis1eP1cTZCTi6uXnxIjPvye-PDBRjutkcwDkqJZSKTcevwqGNPJw6kyAeGbtHVyZ7EIq4JKroQJYMc0mAwoE2WETXqse63h7s_zuXLppJIRSmi-m9mzdup3-rvxvoWMX0PROROeHdBpzqV6bYCSP12aCgYKAfESARASFQHGX2MiCpHhYsPR1Nb9mMgiMD9uQQ0175',1739439251,'Bearer','https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email','eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkMTJhYjc4MmNiNjA5NjI4NWY2OWU0OGFlYTk5MDc5YmI1OWNiODYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NzI0NTIwNTIyMDEtbGI3aDZkMDhmcDFrZm5hNGNta2MyNDMzc2Z2OG9tcjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NzI0NTIwNTIyMDEtbGI3aDZkMDhmcDFrZm5hNGNta2MyNDMzc2Z2OG9tcjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDcyOTQyMTU3NzgyOTM5OTUyMzMiLCJoZCI6ImdtLnB1LmVkdS50dyIsImVtYWlsIjoiczEwOTIwMDJAZ20ucHUuZWR1LnR3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJzaWRrNkdxV3lKWndUWnFjZnhaZjd3IiwibmFtZSI6IualiuW_teiKnTEwOSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMbTlDUnA5ZXFFeGZnVTY3UHZ3d0padTRnVm1salVZRGoxbVBwRC1IT0diVlU4RGc9czk2LWMiLCJnaXZlbl9uYW1lIjoiMTA5IiwiZmFtaWx5X25hbWUiOiLmpYrlv7Xoip0iLCJpYXQiOjE3Mzk0MzU2NTIsImV4cCI6MTczOTQzOTI1Mn0.lzjsDGemAa-CmcILFcLOetgcc8U3C3Offzecu8hI4f1VdwgIiXJazlcXFaWqUx5kDfhgJwHOk0HZajQx-OM5uK8O93yrXKbeAwQZABqwvnanL1NC4U3Si69loRvFYtfOoDZiRaFYzVDQQoaDzHr6F04XfePaSF_5oJC30L3_q_xfe9GK5PouZDS2Z0-dYxFPnnFkIw43nMGoTbMnlnXw2qt9pqJFxOYBuXyw343jFfOqseTv58aLKM-63Kx92Xitfrtrys3mUAquXIwTVslFhl5xMfIBR5rLx3ykMPe0tuhElCMV7NWoWDjhfvmUnMtfeV9oxARCSje6oXkB1ZIiJQ',NULL),
('cm764zog500011q0kimccyie7',5,'oauth','google','106260997741529011561',NULL,'ya29.a0AXeO80SglCplMfiRxYDpio5WU1xePvQPj1PT32bZ6hVXp_DrQeicO8ypAoOdR7s6VLbch6US2NZ25W6Gn6n-ewklqK4RLtp_Lv4GuHJ87SVJ1bBd6YFC6JmOxxQtZ3_6c3Oaca_FxPEZYQcHIjLSbSqemJnZ0D798CMjxrnhaCgYKAeISARASFQHGX2Mi1WHZKlYH9Hrm5pvx3TmLjA0175',1739623864,'Bearer','openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile','eyJhbGciOiJSUzI1NiIsImtpZCI6IjVkMTJhYjc4MmNiNjA5NjI4NWY2OWU0OGFlYTk5MDc5YmI1OWNiODYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NzI0NTIwNTIyMDEtbGI3aDZkMDhmcDFrZm5hNGNta2MyNDMzc2Z2OG9tcjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NzI0NTIwNTIyMDEtbGI3aDZkMDhmcDFrZm5hNGNta2MyNDMzc2Z2OG9tcjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYyNjA5OTc3NDE1MjkwMTE1NjEiLCJlbWFpbCI6InB1YmFqaXF1YW4yOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IjM5QnNGdGJlTktUeUVUSkh4YklBTXciLCJuYW1lIjoiMjjlsYbpnZzlrpzlhavmpbXmi7PnpL4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSUp2V09PU20wS2hBbHVtandmc3N0bVhqbk1IZjhrSXYwT1JMaGQ0bFZrcXkxUm1fTT1zOTYtYyIsImdpdmVuX25hbWUiOiLpnZzlrpzlhavmpbXmi7PnpL4iLCJmYW1pbHlfbmFtZSI6IjI45bGGIiwiaWF0IjoxNzM5NjIwMjY1LCJleHAiOjE3Mzk2MjM4NjV9.N5UinGl-Y9UHf-aAV3Vbsv2n7X9V4dPSp048t5jhuHG4SWux0R_MwNFSU1_bTbui5NoJ4DCzFKPSxyXiisjKfvGnew7LutyjBKghRLjwq1aW75XmbJWempvaDv9tR2dPe9Q6mx8opJpz_sBwcIH7R1mgKIzIweeBnzOJpM88TEYddtl4z5hEgTIPCtYRjFjiBJIthTssP4Ew62aShnO_pRfTYUO6pAplw1zJyDDIlVB6zf9TFmMoz9Njja-aaNr08da-LJB31yIwkVMwRlRHaoM8Qi_KwduIKClVXNzHIkwN3u1BcBZbuGZi4PiF5BtXi4qDZFIG5Ertu_JTT1-8wA',NULL);
/*!40000 ALTER TABLE `Account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Article`
--

DROP TABLE IF EXISTS `Article`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Article` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `images` text COLLATE utf8mb4_unicode_ci,
  `categoryId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Article_categoryId_fkey` (`categoryId`),
  CONSTRAINT `Article_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Article`
--

LOCK TABLES `Article` WRITE;
/*!40000 ALTER TABLE `Article` DISABLE KEYS */;
INSERT INTO `Article` VALUES
(1,'SEO入門攻略：新手必讀的第一堂課','##  前言:為何要學SEO\n\n想像你開了一間精緻的餐廳。\n\n廚藝精湛、食材講究，每一道料理都美得像是藝術品，餐廳的裝潢更是別出心裁。但位置在巷弄內的三樓，沒有明顯的招牌，導致路人難以發現。即使擁有米其林等級的手藝，若沒人發現，再精緻的美食也無人品嘗。\n<img src=\"/uploads/SEO就像餐廳的位置-曝光度決定了客流量.webp\" alt=\"Image\" />\n\n這就像你的網站在網路世界的處境。\n\n你的網站可能內容精彩、設計優美，但如果藏在Google搜尋結果的第10頁，就像那間藏在巷弄裡的高級餐廳一樣，注定難以被發現。再好的內容，若無法觸及目標客群，也只是數位世界中的一座孤島。\n\n就像一間餐廳需要最佳的地理位置、清晰的招牌和良好的口碑，你的網站也需要透過SEO來確保：\n- 出現在搜尋結果的「黃金地段」（第一頁）\n- 擁有能留住人的「美味佳餚」（內容優化）\n- 獲得「美食評論家」的推薦（權威連結）\n\n這就是SEO的魔力 - 讓你的網站從「無人問津的隱藏版餐廳」，轉變為「網路上炙手可熱的人氣店」。\n\n## 一、SEO基礎認知：什麼是搜尋引擎優化？\n搜尋引擎優化（Search Engine Optimization，簡稱SEO）就像是幫網站在搜尋頁面找到最佳位置。想像Google搜尋結果是一座大型圖書館：\n- 不做SEO的網站，就像被隨意放在角落書架的好書，很難被讀者發現\n- 做好SEO的網站，就能擺在入口展示區，讓對這類書籍感興趣的讀者一眼就看到\n做好SEO，就能讓對你網站內容感興趣的訪客，更容易找到你！\n\n## 二、SEO的三大核心要素：技術、內容與外部連結\n\n<img src=\"/uploads/SEO三大要素.webp\" alt=\"Image\" />\n\n### 1\\. 技術面 - 餐廳的基礎建設\n\n就像一間餐廳，再美味的料理也需要舒適的用餐環境。假如餐廳空氣悶熱、動線混亂，就算客人慕名而來也會失望而歸。網站技術面就是如此，若載入速度慢、架構混亂、手機瀏覽體驗差，訪客很快就會離開。\n\n技術面SEO包含：\n- 網站結構優化\\\n   就像餐廳的平面配置要合理，讓客人一進門就知道該往哪走。網站的架構也要清晰有序，讓訪客和搜尋引擎都能輕鬆找到所需資訊。\n- 網站速度優化\\\n   如同餐廳的出餐速度，網站載入速度直接影響訪客體驗。沒人願意等待緩慢的網頁載入，就像沒人願意等待過久的餐點。\n- 行動裝置相容性\\\n   現代餐廳要同時服務內用、外帶、外送的需求。同樣地，網站必須在電腦、手機、平板上都能完美呈現。\n\n### 2\\. 內容面 - 餐廳的料理\n就像一間餐廳的靈魂在於美食，網站的核心就是內容。你可以想像：內容就像主廚精心準備的佳餚，必須美味可口、擺盤精緻，更要符合客人的口味與期待。\n\n優質的內容要注意：\n- 原創性\\\n   如同米其林主廚不會抄襲他人的食譜，而是發揮創意研發獨特料理。你的網站內容也該是原創的，帶給讀者獨特的價值，而不是複製他人的文章。\n- 符合搜尋意圖\\\n   就像廚師要了解客人點牛排「三分熟」的期待，網站內容也要準確回應使用者的搜尋需求。例如，當人們搜尋「義大利麵做法」，他們期待看到的是詳細的烹飪步驟，而不是餐廳推薦。\n- 關鍵字自然運用\\\n   菜單上的描述要讓客人一目了然，不要過度堆砌華麗詞藻。同樣地，關鍵字要自然地融入內容中，而不是生硬地重複塞入。\n\n### 3\\. 外部連結 - 餐廳的口碑\n你可以同時擁有頂級的廚藝和精緻的裝潢，但餐廳的成功還需要良好的口碑。在網路世界中，外部連結就像是餐廳的口碑：\n- 權威推薦\\\n   如同米其林指南或知名美食評論家的推薦能為餐廳帶來聲譽，高品質的外部網站連結也能提升你網站的權威性。一個美食部落客的推薦文比路邊發傳單更有價值，同樣地，知名網站的連結也比雜亂網站的連結更有份量。\n- 自然成長\\\n   真實的口碑是隨著時間自然累積的。貿然購買大量劣質連結，就像花錢請人寫假評價一樣，可能短期內看起來熱鬧，但終究會弄巧成拙。\n- 持續經營\\\n   餐廳的口碑需要持續維護，一次的好評不代表永遠的成功。同樣地，網站的外部連結策略也需要長期經營，持續創造值得分享的內容，自然吸引優質連結。\n\n## 三、實戰策略：如何開始你的SEO之旅\n\n經營SEO就像開設一間新餐廳，需要縝密的規劃，仔細的執行，還要持續觀察市場動向進行調整。讓我們從實務面來看該如何著手：\n\n### 1\\. 市場調查 - 了解競爭環境\n在開始SEO優化之前，首先要了解市場現況。就像開餐廳前，你會先到處品嚐各家餐廳的料理，了解它們的特色與不足。\n\n而在SEO領域，你需要：\n- 關鍵字研究：\\\n   除了找出目標市場最常搜尋的關鍵字外，還要分析這些關鍵字的搜尋意圖、搜尋量和競爭程度。例如「義大利麵」和「義大利麵做法」這兩個關鍵字雖然相似，但搜尋意圖完全不同。\n- 競爭對手分析：\\\n   深入研究排名前面網站的內容架構、更新頻率、文章深度等特點。同時觀察他們的外部連結策略和社群經營方式，找出可以效法或突破的方向。\n- 市場缺口發掘：\\\n   尋找競爭較小但有發展潛力的主題，這些可能是新興的領域或被忽略的細分市場。就像發現某個區域缺乏特定類型的餐廳，這就是市場機會。\n透過深入的市場調查，你能找到最適合自己的定位，避免在競爭太激烈的領域消耗資源。\n\n### 2\\. 制定策略 - 營運計畫\n\n有了市場認知，接著要規劃具體的行動方案。這就像餐廳在開業前要準備的營運計畫書，必須考慮：\n- 目標設定：\\\n   制定明確且可衡量的目標，例如「三個月內讓主要關鍵字進入前20名」或「半年內將有機流量提升50%」。設定合理的階段性目標，讓團隊有明確的努力方向。\n- 資源配置：\\\n   評估現有的人力、技術和預算資源，合理分配到內容製作、技術優化、外部連結建立等不同面向。就像餐廳要在食材、人事、行銷之間取得平衡。\n- 時程規劃：\\\n   建立詳細的時間表，包括內容發布時程、技術優化項目、定期檢討會議等。讓所有工作有條不紊地進行，避免手忙腳亂。\n\n### 3\\. 數據追蹤 - 成效檢視\nSEO的成效必須透過數據來檢視，就像餐廳需要計算營業額、評估成本跟回客率。你需要監控：\n- 流量數據：\\\n   透過Google Analytics等工具，追蹤訪客來源、停留時間、跳出率等指標。特別關注不同頁面的表現差異，了解哪些內容最受歡迎，哪些需要改進。\n- 排名變化：\\\n   定期追蹤關鍵字排名的變化趨勢，觀察優化措施是否有效。同時也要留意競爭對手的排名變化，及時調整策略。\n- 轉換表現：\\\n   監測訪客是否完成預期的目標行為，如填寫表單、訂閱電子報或購買商品。了解流量是否真正帶來商業價值。\n\n### **4\\. 持續優化 - 與時俱進**\nSEO不是一次性的工作，而是需要持續投入的過程。就像餐廳要不斷推出新菜色、改善服務品質，網站也需要：\n- 定期更新內容：\\\n   保持網站的活力，不只是新增內容，還要更新舊文章，確保資訊的即時性和正確性。就像餐廳要適時更新菜單，推出季節限定料理。\n- 技術優化：\\\n   隨時關注Google演算法的更新，及時調整網站架構和技術設定。確保網站在各種裝置上都能完美呈現，提供最佳的使用體驗。\n- 使用者體驗提升：\\\n   根據使用者回饋和行為數據，持續改善網站設計和功能。可能是優化網站速度、改善導航結構，或是增加互動功能。\n\n## 結語：SEO是場持久戰\n\n唯有持續優化，才能在競爭激烈的數位市場中保持優勢。就像一間餐廳要成為米其林星級餐廳，每一個細節都要用心，每一天都是新的挑戰。\n\n回顧剛剛的SEO之旅：\n- 技術面就像餐廳的基礎建設，必須穩固可靠\n- 內容面如同佳餚美饌，要能打動訪客的心\n- 外部連結則是口碑相傳，需要時間累積\n- 實戰策略更是環環相扣，缺一不可\n\n記住，SEO不是速成的技術，而是需要長期投入的經營之道：\n- 要有耐心，接受漸進式的成長\n- 要夠細心，關注每個優化細節\n- 更要有恆心，持續產出優質內容\n\n就像米其林指南中說的：「值得繞道前往的餐廳」，你的目標就是讓網站成為「值得停留瀏覽的網頁」。這需要時間，需要努力，但只要方向正確，持之以恆，相信你的網站終將在搜尋結果中佔有一席之地。\n\n## 新手必知：SEO常見問題速答\n\n### **Q1：做SEO要等多久才有效果？**\n\n優化是漸進式的，通常需要3-6個月才能看到明顯成效。就像餐廳經營，需要時間累積口碑，沒有速成的方法。\n\n### **Q2：一定要會寫程式嗎？**\n\n基礎SEO不需要深入的程式能力。重點是了解優化原則，善用現成工具。需要技術支援時，可以尋求專業協助。\n\n### **Q3：SEO和寫文章有什麼關係？**\n\n優質內容是SEO的核心。好的文章自然能吸引讀者停留、分享，進而提升網站權重。內容策略應該以讀者需求為重，而不是討好搜尋引擎。\n\n### **Q4：我的網站內容要寫多少字才夠？**\n\n沒有標準答案，重點是內容要有價值、容易理解。與其擔心字數，不如專注在：文章是否解決讀者問題、說明是否清楚等實質內容。\n\n### **Q5：常用的SEO工具有哪些？**\n\n入門可以先從這些免費工具開始：\n- Google Search Console：了解網站在Google的表現\n- Google Analytics：分析網站流量來源與使用者行為\n- 關鍵字規劃工具：研究關鍵字搜尋量\n\n### **Q6：做SEO需要花錢嗎？**\n\n其實SEO的精髓在於「內容力」，不在於「花錢力」！除了基本的網域和主機費用外，重要的是持續產出對讀者有價值的內容。\n\n更棒的是，好的SEO策略自然而然就能成為品牌行銷的一部分：當你的文章經常出現在搜尋結果前面，不只帶來流量，更能建立品牌信任度和專業形象。這可是用錢都難以買到的品牌資產！','[{\"id\":\"41cnmoxc1\",\"url\":\"/uploads/SEO三大要素.webp\"},{\"id\":\"xwne4prks\",\"url\":\"/uploads/SEO就像餐廳的位置-曝光度決定了客流量.webp\"}]',1,'2025-02-21 06:04:01.688','2025-02-22 08:57:26.707'),
(2,'Google如何閱讀你的網站？認識搜尋引擎的運作原理','## 前言\n你是否曾想過以下問題？\n- 為什麼只要輸入幾個關鍵字，就能在數十億網頁中找到所需資訊？\n- 搜尋引擎是如何判斷哪些網頁更值得顯示在前面？\n- 為何我們習慣說「我Google一下」，而不是「我Bing一下」或「Yahoo一下」？\n\n## 一、搜尋引擎 vs 瀏覽器\n你知道瀏覽器跟搜尋引擎是完全不同的兩樣東西嗎？雖然我們常常一起使用它們，但它們的功能其實差很多呢！來比較一下他們的差別：\n<img src=\"/uploads/瀏覽器跟搜尋引擎的差異.webp\" alt=\"Image\" />\n\n想像你在圖書館裡找一本特定的書：\n- 搜尋引擎就像是圖書館的資料檢索系統，告訴你書在哪裡\n- 瀏覽器則是讓你能實際閱讀這本書的工具\n\n## 二、常見的搜尋引擎概覽\n在眾多搜尋引擎中，各家都有其特色。讓我們來看看主要的幾個：\n<img src=\"/uploads/常見搜尋引擎介紹.webp\" alt=\"Image\" />\n\n由於Google在搜尋引擎市場的絕對優勢，「Google」這個詞已經逐漸成為了搜尋的代名詞，也衍生出了「我Google一下」這樣的日常用語。因此，本文接下來也將以Google為例，為大家介紹搜尋引擎的運作原理。\n\n## 三、Google搜尋引擎如何運作？\n<img src=\"/uploads/Google搜尋引擎運作過程.webp\" alt=\"Image\" />\n\n### 第一步：網頁探索 - 爬取（Crawling）\nGoogle 使用一個叫做 GoogleBot 的程式，就像網路世界的圖書管理員，在網路上不停地工作，這些GoogleBot 會：\n- 系統性地探索新網頁：\\\n   每天都有無數新網站和新內容出現，GoogleBot 會自動發現並記錄這些新資訊。\n- 記錄網頁的更新：\\\n   已經收錄的網頁可能隨時更新內容，像新聞網站發布新文章，或是購物網站更新商品，GoogleBot 會定期回訪檢查。\n- 順著網頁連結找到其他頁面並收錄：\\\n   當 GoogleBot 在讀取某個網頁時，會發現頁面中連到其他網頁的連結，接著前往這些新連結，不斷擴展收錄的範圍。\n\n### 第二步：資料處理 - 索引（Indexing）\n\n收集到網頁後，Google 會開始處理這些資料，就像館員根據新書的內容把它們放到不同的書架上，Google將會：\n- 分析並理解網頁內容主題：\\\n   每當收到新網頁時，Google會試圖理解網頁在說什麼主題，是新聞、購物資訊或是教學文章。\n- 找出重要資訊和關鍵字：\\\n   系統會記下網頁中重要的字詞和內容，方便之後能快速找到需要的資訊。\n- 記錄網頁之間的關聯性：\\\n   Google會記錄網頁之間的連結關係。比如當一個台北美食推薦的網頁連結到人氣餐廳評價的網頁時，Google就會知道這兩個網頁都跟餐廳美食有關。這樣當你搜尋餐廳相關資訊時，Google就能幫你找到更多相關的網頁。\n- 建立快速搜尋用的資料庫：\\\n   把處理好的資訊存入特殊的資料庫中。這樣當使用者搜尋時，系統就能在幾秒內從數十億個網頁中找出最相關的結果。\n\n### 第三步：評分排序（排名）\n\n當使用者進行搜尋時，搜尋引擎會依據多個面向為每個網頁打分數：\n內容品質：\n- 資訊是否完整且實用\n- 文章是否專業且可靠\n- 是否能回答使用者的問題\n\n網站可信度：\n- 其他優質網站是否引用這個網頁\n- 網站的歷史表現如何\n- 內容是否經常更新\n\n使用者體驗：\n- 網頁載入速度快不快\n- 手機瀏覽方便嗎\n- 版面是否清楚好讀\n\n### 第四步：呈現結果\n最後，Google會將排名後的結果呈現給使用者。為了讓你更容易找到需要的資訊，它會：\n- 依據內容相關性，把最符合你搜尋需求的結果排在前面\n- 根據你所在的位置，優先顯示離你較近的資訊（例如搜尋餐廳時，會先顯示附近的店家）\n- 自動調整顯示方式，讓你無論用手機還是電腦都能清楚看到內容\n- 提供多種形式的搜尋結果，包括網頁、圖片、影片、地圖等，方便你選擇最適合的資訊形式\n\n## 四、Google的演算法\n想像Google是一位嚴格的評審，會用不同的標準來評分每個網站。以下是幾個最重要的評分標準（演算法）：\n<img src=\"/uploads/Google演算法介紹.webp\" alt=\"Image\" />\n\n1. PageRank演算法：「人緣度」評分\n   - 這就像是看一個人的朋友圈有多好\n   - 當其他網站連結到你的網站，就像在給你投票支持\n   - 如果連結來自知名網站（例如Yahoo、PTT），分數會更高\n   - 例子：如果一家餐廳被許多美食部落客推薦，Google就會認為這家餐廳很重要\n\n2. Panda演算法：「內容品質」評分 \n   - 檢查網站內容是否有價值\n   - 不喜歡抄襲或複製貼上的內容\n   - 喜歡原創、深入的文章\n   - 例子：一篇親身體驗的餐廳評價會比複製別人的評論得到更高分數\n\n3. Penguin演算法：「交友品質」評分\n   - 檢查網站的連結是否健康自然\n   - 打擊購買連結或垃圾連結的行為\n   - 鼓勵真實、自然的網站互動\n   - 例子：透過真實好內容獲得的連結，比付費請人加連結更有價值\n\n4. Mobile-First演算法：「手機體驗」評分\n   - 優先看網站在手機上的表現\n   - 檢查網頁是否好滑、好點選\n   - 重視載入速度\n   - 例子：如果你的網站在手機上很難操作或跑得很慢，分數就會降低\n\n5. BERT演算法：「搜尋意圖理解」系統\n   - 幫助Google更懂人類的搜尋用語\n   - 能理解較長的搜尋句子\n   - 提供更準確的搜尋結果\n   - 例子：當你搜尋「附近有沒有便宜又好吃的日本料理」，Google能更準確理解你的需求\n\n### 重要提醒：\n\n- Google每年都會更新這些評分標準數百次\n- 重大更新可能會大幅改變網站排名\n- 最重要的是：專注於提供優質內容和良好使用體驗，而不是鑽研演算法漏洞\n\n## 五、Google結合AI的搜尋新時代\n\n在AI技術快速發展的今天，Google正在將生成式AI技術整合到搜尋引擎中，主要通過SGE（Search Generative Experience，搜尋生成式體驗）為使用者帶來更方便的搜尋體驗。\n\n### 智慧摘要功能 (SGE)\n\nGoogle從2023年開始推出的SGE，保留了我們熟悉的網頁搜尋結果，同時加入了AI整理的摘要回答。這就像是有一位助手，幫你讀完所有相關網頁，並整理出重點。\n\n不過目前SGE仍在實驗階段，需要透過Google Search Labs申請試用，部分地區和語言可能暫時無法使用。\n\n當你搜尋「如何選購咖啡豆」時，傳統搜尋只會列出相關網頁，有了SGE後，你會先看到一段AI整理的完整解說，包含：\n- 新手必懂的咖啡豆基礎知識\n- 選購時的關鍵考量點\n- 推薦的購買管道\n下方仍然保留原本的網頁連結，方便深入閱讀\n\n值得注意的是，對於醫療、法律等專業領域的資訊，建議還是以傳統搜尋結果為主，並查看原始網頁內容。由於AI技術仍在發展中，生成的內容可能偶有錯誤，重要資訊最好查證多個來源。\n\n這些新功能雖然強大，但它們只能作為輔助工具，幫助我們更有效率地獲取和處理資訊，無法完全取代傳統搜尋方式。使用者可以隨時切換回傳統搜尋模式，並根據當下需求選擇最適合的方式。\n\n## 結語\n\n經過這趟搜尋引擎探索之旅，我們發現Google就像個不斷學習的聰明助手。從最基本的「找網頁」「存資料」開始，到現在能理解完整句子甚至對話，這些技術進步都在做一件事：幫我們更快找到需要的答案。\n\n對網站經營者來說，有三條永遠不變的黃金守則：\n\n### 原則一：先讓人看懂，機器自然懂\n別被複雜的演算法嚇到，其實只要把握一個關鍵：你的內容真的能解決問題嗎？就像寫旅遊指南，與其硬塞「台北美食推薦 TOP10」這類關鍵字，不如誠實寫出「這家牛肉麵湯頭偏鹹，份量較適合女生」的真實體驗。\n\n### 原則二：手機體驗是生存條件\n現在超過60%的搜尋發生在手機上。請注意這些致命傷：\n- 文字太小時需要放大鏡才能閱讀\n- 按鈕距離太近經常誤點\n- 首張圖片載入超過3秒\n這些問題會讓訪客秒離開，再好的內容也白費。\n\n### 原則三：專業感藏在細節裡\n想讓Google和讀者信服？試著做到：\n1. 引用權威資料 : 附上政府公開數據或研究報告連結\n2. 維護資訊時效 : 每季檢查更新過時的統計數字\n3. 展現真實經歷 :在作者簡介寫「實際經營咖啡廳5年」\n\n就算未來AI能自動生成答案，那些真人分享的實戰經驗、有溫度的故事、經過驗證的專業知識，具有永遠都無法取代的價值。\n\n因此，從今天開始，試著從內容與使用者體驗這兩點下手，讓你的網站慢慢建立起真正的價值。SEO是一場長跑，而每一步的努力，都會讓你的網站更接近搜尋結果的頂端。','[{\"id\":\"wpc4hfubl\",\"url\":\"/uploads/Google搜尋引擎運作過程.webp\"},{\"id\":\"8gw2ij7bl\",\"url\":\"/uploads/Google演算法介紹.webp\"},{\"id\":\"r5rv9954m\",\"url\":\"/uploads/瀏覽器跟搜尋引擎的差異.webp\"},{\"id\":\"8l6fooan4\",\"url\":\"/uploads/常見搜尋引擎介紹.webp\"}]',1,'2025-02-24 06:19:28.787','2025-02-24 09:33:15.177'),
(3,'Google關鍵字排名優化心法：必懂的搜尋邏輯與關鍵字策略','## 前言:為何要進行關鍵字研究\n\n想像一下，當你的冰箱壞掉需要更換新的，你會如何搜尋？大多數人會直接在 Google 輸入「冰箱 推薦」、「省電冰箱」或「冰箱品牌比較」這樣的簡短關鍵字，而非輸入完整問句。接著，搜尋引擎會列出含有這些關鍵字的網頁。\n\n從業者的角度來看，如果希望消費者在搜尋時看到你的網站，就需要確保你的網頁內容包含這些可能被搜尋的關鍵字，才有機會出現在搜尋結果中。\n\n這就是要進行關鍵字研究的目的 : 找出目標客群最常使用的搜尋字詞，讓網站更容易被看見。\n\n## 搜尋意圖:了解使用者的需求\n<img src=\"/uploads/no搜尋意圖決定內容類型和優化方向 .webp\" alt=\"Image\" />  \n    \n### 搜尋意圖大致分成以下四種：\n### 1. 資訊型：\n使用者想要獲取知識或解決問題，比方說「現任台灣總統是誰」或「如何減肥」，通常結果頁面會顯示詳細且結構化的解答。   \n\n     優化方向: 提供完整且易懂的資訊，善用標題、小標和重點列表，讓內容更容易閱讀和理解。可以加入圖片或影片來輔助說明。\n    \n### 2. 商業調查型：\n使用者想要購買某種產品，但還在比較評估階段。就像上面提到的「冰箱 推薦」，他們需要看到產品評測、比較和使用心得等資訊來做決定。    \n\n     優化方向: 提供詳細的產品比較表、優缺點分析、實際使用評價等內容。善用圖片展示產品特色，並提供清楚的價格資訊。\n    \n### 3. 交易型：\n使用者已經決定要購買特定產品，正在尋找購買管道。例如搜尋「Panasonic NR-F654HX-X1 價格」，這時搜尋結果會優先顯示購物網站或實體店家的購買連結。 \n   \n    優化方向: 確保產品資訊完整，包括價格、規格、現貨狀況等。提供清楚的購買按鈕或連結，簡化購買流程。\n    \n### 4. 導航型：\n使用者想要直接前往特定網站或實體店家，例如搜尋「全國電子」或「蝦皮購物」。這類搜尋通常會直接顯示官網連結或店家地址資訊。  \n   \n    優化方向:確保品牌名稱、地址、聯絡方式等資訊正確且容易找到。優化 Google 商家檔案，提供完整的營業時間和交通資訊。    \n\n## 短中長尾關鍵字:掌握關鍵字的競爭程度\n\n<img src=\"/uploads/短中長尾關鍵字差異.webp\" alt=\"Image\" />\n\n### 短尾關鍵字：\n短尾關鍵字是最簡短的詞，例如「冰箱」或「美食」。這類詞通常出現在搜尋的第一步，因為使用者可能還沒明確決定自己要找什麼，所以搜尋量最大。雖然用這些關鍵字搜尋的人很多，但大部分人可能只是隨便看看，不一定真的會買東西。\n\n### 中尾關鍵字：\n接著，當我們的目標逐漸清楚，就會在搜尋中加入一點描述，比如「日立冰箱」或「台北美食」。這就是中尾關鍵字，它比短尾關鍵字稍具體一點，但仍有不錯的搜尋量。因為搜尋的人已經縮小範圍，購買機會也明顯提升。\n\n### 長尾關鍵字：\n長尾關鍵字是非常具體的搜尋詞，像是「日立483公升六門冰箱」、「台北東區平價日本料理」。搜尋這類詞的人通常目標非常明確，因此購買和轉換的機會最高。而且這些詞的競爭比短尾或中尾關鍵字小得多，適合新手或小型網站用來吸引目標讀者。\n\n不過其實短中長尾關鍵字是一種相對的概念，並沒有絕對的界線，主要是依照關鍵字的競爭程度、搜尋量和字詞長度來區分。在不同產業中，什麼樣的詞該算短尾或長尾，標準也會不太一樣。\n\n## 結語:實際應用小撇步\n\n了解了搜尋意圖和短中長尾關鍵字後，來看看怎麼應用在部落格上。 很多人剛開始寫部落格，都想寫「台北美食推薦」這種短尾文章，但競爭太激烈了，很難在搜尋結果中被看見。\n\n其實我們可以這樣規劃：先寫「2024台北東區日本料理推薦」這種中尾主題，鎖定特定區域和料理類型。再延伸寫「台北東區平價無菜單日本料理」、「台北東區適合約會的日本料理包廂」這類長尾主題。\n\n 長尾文章雖然搜尋量小，但因為夠具體，反而更容易打中讀者。像是搜「台北東區平價日本料理」的人，想知道的就很明確：大概要花多少錢？有什麼必點餐點？離捷運站遠不遠？適合跟誰來吃？有沒有限制用餐時間？ \n\n把這些讀者想知道的資訊寫清楚，文章自然容易在搜尋結果中被看見。記住，寫部落格不是在堆關鍵字，而是要寫對讀者有幫助的內容。\n\n 現在我們已經了解關鍵字研究的基本觀念了，下一篇文章就來教大家實際操作的方法和技巧。','[{\"id\":\"418l0jp7g\",\"url\":\"/uploads/短中長尾關鍵字差異.webp\"},{\"id\":\"l1ki0hfk0\",\"url\":\"/uploads/搜尋意圖決定內容類型和優化方向 .webp\"},{\"id\":\"wf5u3xjch\",\"url\":\"/uploads/no關鍵字選擇5.webp\"},{\"id\":\"aga8p2hb0\",\"url\":\"/uploads/搜尋意圖決定內容類型和優化方向 .webp\"},{\"id\":\"u7iv1ye2h\",\"url\":\"/uploads/搜尋意圖決定內容類型和優化方向  - 複製.webp\"},{\"id\":\"3klwy7on9\",\"url\":\"/uploads/no搜尋意圖決定內容類型和優化方向 .webp\"}]',1,'2025-03-06 08:20:27.565','2025-03-15 07:17:30.835'),
(6,'Google關鍵字排名優化實戰：關鍵字研究工具與操作指南','<!-- HIDE_IMAGE_CAPTIONS -->\n## 關鍵字研究第一步:明確主題\n上一篇我們講解了關鍵字研究的基本概念，這一篇就來講解該怎麼實作吧!\n\n首先要確定主題。有網站的朋友，想想你的網站屬於什麼領域；還沒有網站的話，也可以選個主題來練習。\n\n以「沙發工廠」為例，假設我們有款新推出的「電動沙發」，想寫篇相關文章增加自然曝光。這時可以使用「電動沙發」作為起點，去尋找相關關鍵字組合，找出適合優化的關鍵字。\n\n## 關鍵字研究第二步:收集關鍵字清單\n\n現在我們設定好了主題，而上一篇文章有提到我們做關鍵字研究的目的是透過尋找最常用的搜尋字詞，以提高網站被看見的機會。 \n\n所以我們必須先去尋找平常人會搜尋甚麼跟電動沙發有關的關鍵詞，然後再收集成一個關鍵字清單。\n\n我們可以使用以下工具: \n\n1. google搜尋 \n   大家應該都知道在搜尋頁面的底部有一個關鍵字推薦區塊吧，這是最容易找到相似關鍵字的方法，不過因為一次顯示的數量有限，所以這個方法會比較繁瑣一點。\n\n   1\\.1 在google搜尋「電動沙發」，滑到最下面有一個「其他人也搜尋了以下項目:」區塊\n<img src=\"/uploads/1-1google搜尋關鍵字.webp\" alt=\"Image\" />\n\n   1\\.2 把關鍵字複製到word檔裡\n<img src=\"/uploads/1-2複製關鍵字到word黨.webp\" alt=\"Image\" />\n\n   1\\.3 也可以透過點擊那些google推薦的關鍵字，再找到其他相關的關鍵字\n<img src=\"/uploads/1-3從相似關鍵字繼續延伸.webp\" alt=\"Image\" />\n\n2. Google關鍵字規劃工具\n\n   Google關鍵字規劃工具的主要用途其實是拿來做關鍵字廣告規劃。但也可以拿來做關鍵字研究，它的優點是不花錢就能使用，不過要看到更準確、更詳細的數據，需要在Google Ads上投入足夠的廣告預算。\n\n   2\\.1 先註冊Google Ads， 結束後把滑鼠移到側邊欄的「工具」選項，點擊關鍵字規劃工具\n<img src=\"/uploads/2-1Google關鍵字規劃工具.webp\" alt=\"Image\" />\n\n   2\\.2 點擊「尋找新的關鍵字」\n<img src=\"/uploads/2-2Google關鍵字規劃工具.webp\" alt=\"Image\" />\n\n   2\\.3 輸入「電動沙發」，再按「取得結果」\n<img src=\"/uploads/2-3Google關鍵字規劃工具.webp\" alt=\"Image\" />\n\n   2\\.4 點擊「關鍵字」全選關鍵字，再按「複製」\n<img src=\"/uploads/2-4Google關鍵字規劃工具.webp\" alt=\"Image\" />\n\n   2\\.5 貼進word檔\n<img src=\"/uploads/2-5Google關鍵字規劃工具.webp\" alt=\"Image\" />\n\n3.  [keywordtool.io](https://keywordtool.io/)\n\n    這是一個非常簡單易用的網站，只要輸入關鍵字就可以查到一整個關鍵字清單，可惜的是沒有訂閱就無法看到關鍵字的數據，但沒關係，因為現在我們只是在做初步的關鍵字清單收集，只要有關鍵字就足夠了。\n\n    3\\.1 進入網頁先選擇國家、語言\n<img src=\"/uploads/3-1keywordtool.webp\" alt=\"Image\" />\n\n    3\\.2 在前面的輸入框輸入選定的關鍵字，並點擊搜尋\n<img src=\"/uploads/3-2keywordtool.webp\" alt=\"Image\" />\n\n    3\\.3 然後就會出現搜尋結果，不過免費板無法看到關鍵字的詳細訊息\n<img src=\"/uploads/3-3keywordtool.webp\" alt=\"Image\" />\n\n    3\\.4 點擊「keywords」左邊的框，把關鍵字全部選起來\n<img src=\"/uploads/3-4keywordtool.webp\" alt=\"Image\" />\n\n    3\\.5 點擊右下角有三個圖標的紫色按鈕，再按下「copy」複製關鍵詞\n<img src=\"/uploads/3-5keywordtool.webp\" alt=\"Image\" />\n\n\n    3\\.6 貼到word檔裡\n<img src=\"/uploads/3-6keywordtool.webp\" alt=\"Image\" />\n\n\n到這邊可以先結束關鍵字清單收集的部分，不過建議不要只依靠一種工具或方法來收集關鍵字。因為關鍵字研究就像淘金，收集的樣本越多，發現高價值關鍵字的機會就越大。所以最好多收集一點關鍵字放進清單裡。\n\n## 關鍵字研究第三步:關鍵字分類\n\n剛剛我們收集了許多跟「電動沙發」有關的關鍵字，但是他們現在全部混在一起，但還記得在上一篇提到的搜尋意圖嗎，不同的搜尋意圖有不同的優化方式，文章所需內容也會不太一樣。所以我們可以先根據搜尋意圖來做一個簡單的分類。\n\n1. 複製word檔裡的關鍵字到excel\n<img src=\"/uploads/關鍵字分類1.webp\" alt=\"Image\" />\n\n2. 把關鍵字依據搜尋意圖來做分類\n<img src=\"/uploads/關鍵字分類2.webp\" alt=\"Image\" />\n\n其實這樣子分類比較粗略，可以再多觀察是否有相似主題的關鍵字，然後把他們歸類在一起。\n\n## 關鍵字研究第四步:關鍵字選擇\n\n做完分類就可以來選擇關鍵字了，那挑選關鍵字有甚麼要注意的地方呢？\n\n首先，我們進行關鍵字研究的目的是找到大眾最常搜尋的關鍵字，也就是搜尋量大的關鍵字。\n\n因此，我會將搜尋量從大排到小來進行篩選。\n\n然而，搜尋量大的關鍵字並不一定適合優化。最好從中挑出競爭程度較低的關鍵字。\n\n為什麼呢？\n\n想像一下你同時報名了兩場馬拉松：一場人數爆滿，另一場人數寥寥無幾。\n\n顯然，在人數較少的那場馬拉松中，你獲得前面名次的機會會更高。同樣的道理適用於關鍵字優化。如果你選擇的關鍵字競爭激烈，那麼即使有大量搜尋量，你也可能難以在搜尋結果中脫穎而出。\n\n所以，當我們選擇關鍵字時，最好找那些搜尋量大而競爭程度比較低的關鍵字。\n\n那要如何看到那些數據呢?\n\n我們可以使用剛剛介紹到的Google關鍵字搜尋工具，雖然免費版只能看到大致數據，但還是具有一定的參考價值。\n\n### 使用Google關鍵字規劃工具挑選關鍵字\n\n在前面我們設定了要寫一篇和「電動沙發」有關的部落格文章，那根據上一篇提到的搜尋意圖，哪些搜尋意圖適合拿來撰寫部落格文章呢?\n\n沒錯，就是資訊型跟商業調查型，下面就以資訊型的關鍵字示範要如何選擇關鍵字。\n\n1. 把資訊型的關鍵字都複製起來\n<img src=\"/uploads/關鍵字選擇1.webp\" alt=\"Image\" />\n\n2. 打開Google Ads裡的關鍵字規劃工具，不過這次改選擇右邊的”取得搜尋量和預測”\n<img src=\"/uploads/關鍵字選擇2.webp\" alt=\"Image\" />\n\n3. 把剛剛複製的關鍵字貼上去，並點擊「開始使用」\n<img src=\"/uploads/關鍵字選擇3.webp\" alt=\"Image\" />\n\n4. 按下「平均每月搜尋量」可以讓月搜尋量從大排到小\n<img src=\"/uploads/關鍵字選擇4.webp\" alt=\"Image\" />\n\n5. 接下來就可以開始挑選適合優化的關鍵字\n<img src=\"/uploads/關鍵字選擇5.webp\" alt=\"Image\" />\n\n以上圖為例，我們可以發現「電動沙發 缺點」這個關鍵字的月搜尋量是裡面最高的，而且競爭程度是「低」，所以可以選擇以這個關鍵字為主題撰寫一篇相關文章。\n\n##  關鍵字研究總結\n\n在本篇文章中，我們從定主題開始，接著收集關鍵字、分類搜尋意圖，並使用Google關鍵字規劃工具挑選出合適的關鍵字。雖然這些步驟看似繁瑣，但它們是打造一篇好文章的基礎。\n\n選完關鍵字只是第一步，更重要的是如何將它們自然地融入文章中。記住，保持語氣自然，並提供讀者真正需要的資訊，這樣才能吸引他們停下來閱讀。\n\n希望閱讀完本篇文章後，你能掌握關鍵字研究的技巧，並成功提升網頁的Google關鍵字排名！','[{\"id\":\"s5n4wv3cm\",\"url\":\"/uploads/2.webp\"},{\"id\":\"njafr4xm9\",\"url\":\"/uploads/2.webp\"},{\"id\":\"eajnc1n9q\",\"url\":\"/uploads/2.webp\"},{\"id\":\"6k2u2fpki\",\"url\":\"/uploads/2.webp\"},{\"id\":\"3e4jkw2dz\",\"url\":\"/uploads/2.webp\"},{\"id\":\"cxbk23oan\",\"url\":\"/uploads/1.webp\"},{\"id\":\"h1hs09i9r\",\"url\":\"/uploads/1.webp\"},{\"id\":\"qtz6pv6sn\",\"url\":\"/uploads/1.webp\"},{\"id\":\"gzl4q1jjp\",\"url\":\"/uploads/關鍵字分類2.webp\"},{\"id\":\"ah8s4ysc4\",\"url\":\"/uploads/關鍵字分類1.webp\"},{\"id\":\"oifizvva9\",\"url\":\"/uploads/3.webp\"},{\"id\":\"1sr8fr8fu\",\"url\":\"/uploads/3.webp\"},{\"id\":\"4jo8cisbl\",\"url\":\"/uploads/3.webp\"},{\"id\":\"1oi8vihsu\",\"url\":\"/uploads/3.webp\"},{\"id\":\"cjvw0v8ef\",\"url\":\"/uploads/3.webp\"},{\"id\":\"vlsfh8bxk\",\"url\":\"/uploads/3.webp\"},{\"id\":\"qn5ktsk1f\",\"url\":\"/uploads/關鍵字選擇5.webp\"},{\"id\":\"zigh30li3\",\"url\":\"/uploads/關鍵字選擇4.webp\"},{\"id\":\"leafxaveg\",\"url\":\"/uploads/關鍵字選擇3.webp\"},{\"id\":\"e4p7s6685\",\"url\":\"/uploads/關鍵字選擇2.webp\"},{\"id\":\"e5v97hz5r\",\"url\":\"/uploads/關鍵字選擇1.webp\"},{\"id\":\"c69yaw017\",\"url\":\"/uploads/1-2複製關鍵字到word黨.webp\"},{\"id\":\"tckgpxnt2\",\"url\":\"/uploads/1-1google搜尋關鍵字.webp\"},{\"id\":\"scs3l0bdj\",\"url\":\"/uploads/2-5Google關鍵字規劃工具.webp\"},{\"id\":\"2i50jhjrp\",\"url\":\"/uploads/2-4Google關鍵字規劃工具.webp\"},{\"id\":\"j3t5nz7ud\",\"url\":\"/uploads/2-3Google關鍵字規劃工具.webp\"},{\"id\":\"nxx14wvaw\",\"url\":\"/uploads/2-2Google關鍵字規劃工具.webp\"},{\"id\":\"94cl1k2lc\",\"url\":\"/uploads/2-1Google關鍵字規劃工具.webp\"},{\"id\":\"pe6eyc0wi\",\"url\":\"/uploads/1-3從相似關鍵字繼續延伸.webp\"},{\"id\":\"h8tcb1hp5\",\"url\":\"/uploads/3-6keywordtool.webp\"},{\"id\":\"0jzwv0saj\",\"url\":\"/uploads/3-5keywordtool.webp\"},{\"id\":\"hx48sigb4\",\"url\":\"/uploads/3-4keywordtool.webp\"},{\"id\":\"h708tpfjl\",\"url\":\"/uploads/3-3keywordtool.webp\"},{\"id\":\"d1ntdyq1y\",\"url\":\"/uploads/3-2keywordtool.webp\"},{\"id\":\"4w0ivzxj8\",\"url\":\"/uploads/3-1keywordtool.webp\"},{\"id\":\"0t4eoo7d2\",\"url\":\"/uploads/no關鍵字選擇5.webp\"}]',1,'2025-03-14 15:14:55.865','2025-03-15 06:03:45.866');
/*!40000 ALTER TABLE `Article` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Bookmark`
--

DROP TABLE IF EXISTS `Bookmark`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Bookmark` (
  `id` int NOT NULL AUTO_INCREMENT,
  `articleId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Bookmark_articleId_userId_key` (`articleId`,`userId`),
  KEY `Bookmark_userId_fkey` (`userId`),
  CONSTRAINT `Bookmark_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Bookmark_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Bookmark`
--

LOCK TABLES `Bookmark` WRITE;
/*!40000 ALTER TABLE `Bookmark` DISABLE KEYS */;
/*!40000 ALTER TABLE `Bookmark` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Category`
--

DROP TABLE IF EXISTS `Category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_name_key` (`name`),
  UNIQUE KEY `Category_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Category`
--

LOCK TABLES `Category` WRITE;
/*!40000 ALTER TABLE `Category` DISABLE KEYS */;
INSERT INTO `Category` VALUES
(1,'SEO優化','seo','2025-02-12 04:35:08.271','2025-02-17 04:33:34.622'),
(4,'閱讀心得','reading-reflections','2025-02-12 07:37:23.621','2025-02-12 08:43:05.621');
/*!40000 ALTER TABLE `Category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Comment`
--

DROP TABLE IF EXISTS `Comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `articleId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Comment_articleId_fkey` (`articleId`),
  KEY `Comment_userId_fkey` (`userId`),
  KEY `Comment_parentId_fkey` (`parentId`),
  CONSTRAINT `Comment_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Comment`
--

LOCK TABLES `Comment` WRITE;
/*!40000 ALTER TABLE `Comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `Comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CommentLike`
--

DROP TABLE IF EXISTS `CommentLike`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CommentLike` (
  `id` int NOT NULL AUTO_INCREMENT,
  `commentId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CommentLike_commentId_userId_key` (`commentId`,`userId`),
  KEY `CommentLike_userId_fkey` (`userId`),
  CONSTRAINT `CommentLike_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CommentLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CommentLike`
--

LOCK TABLES `CommentLike` WRITE;
/*!40000 ALTER TABLE `CommentLike` DISABLE KEYS */;
/*!40000 ALTER TABLE `CommentLike` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Like`
--

DROP TABLE IF EXISTS `Like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Like` (
  `id` int NOT NULL AUTO_INCREMENT,
  `articleId` int NOT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Like_articleId_userId_key` (`articleId`,`userId`),
  KEY `Like_userId_fkey` (`userId`),
  CONSTRAINT `Like_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Like`
--

LOCK TABLES `Like` WRITE;
/*!40000 ALTER TABLE `Like` DISABLE KEYS */;
/*!40000 ALTER TABLE `Like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Session`
--

DROP TABLE IF EXISTS `Session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Session` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sessionToken` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `expires` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  KEY `Session_userId_fkey` (`userId`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Session`
--

LOCK TABLES `Session` WRITE;
/*!40000 ALTER TABLE `Session` DISABLE KEYS */;
/*!40000 ALTER TABLE `Session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetPasswordToken` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` longtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES
(1,'小倉鼠','abcd901125@gmail.com',NULL,'/uploads/avatar-1-1739794388594.webp','$2a$10$pVvcIK4gQkA41KA1tUUs7.P8tQeNcN1mK0getn7OcKDC99vkMT71S',NULL,'/uploads/avatar-1-1739794388594.webp','2025-02-12 04:34:15.345','2025-02-17 12:13:08.817',0),
(2,'楊念芝','abcd30378@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocK3GfPAJF5aAdqWt2FG8Hy7Soa7xFly6nJhjmEvO-dW1Vk1bdg=s96-c',NULL,NULL,NULL,'2025-02-12 14:13:25.065','2025-02-12 14:13:25.065',0),
(3,'楊念芝109','s1092002@gm.pu.edu.tw',NULL,'https://lh3.googleusercontent.com/a/ACg8ocLm9CRp9eqExfgU67PvwwJZu4gVmljUYDj1mPpD-HOGbVU8Dg=s96-c',NULL,NULL,NULL,'2025-02-13 08:34:12.312','2025-02-13 08:34:12.312',0),
(4,'測試','123@gmail.com',NULL,NULL,'$2a$12$I5cEs9qNRqlXo29SRfALN.i.AVOqzrGW0m6nva9OrxIyRhUB9WynC',NULL,'https://api.dicebear.com/7.x/lorelei/svg?seed=123@gmail.com','2025-02-14 13:29:43.453','2025-02-14 13:30:06.076',0),
(5,'28屆靜宜八極拳社','pubajiquan28@gmail.com',NULL,'https://lh3.googleusercontent.com/a/ACg8ocIJvWOOSm0KhAlumjwfsstmXjnMHf8kIv0ORLhd4lVkqy1Rm_M=s96-c',NULL,NULL,NULL,'2025-02-15 11:51:05.944','2025-02-15 11:51:05.944',0),
(6,'Test','test@gmail.com',NULL,NULL,'$2a$12$7XxiUWydcHlR.SZ2p/idEeDhBAZEebySndqdP6.3INZb65fJ7ykky',NULL,'https://api.dicebear.com/7.x/lorelei/svg?seed=test@gmail.com','2025-03-12 09:00:53.524','2025-03-12 09:00:53.524',0);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-15 12:15:03
