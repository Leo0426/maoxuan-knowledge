import { NavLink, Route, Routes } from "react-router-dom";

import ArticlePage from "./pages/ArticlePage";
import DisclaimerPage from "./pages/DisclaimerPage";
import GraphPage from "./pages/GraphPage";
import GuidePage from "./pages/GuidePage";
import IssuePage from "./pages/IssuePage";
import MapPage from "./pages/MapPage";
import SearchPage from "./pages/SearchPage";
import TimelinePage from "./pages/TimelinePage";

const navItems = [
  { to: "/", label: "导读", code: "导" },
  { to: "/timeline", label: "时间线", code: "时" },
  { to: "/map", label: "地图", code: "图" },
  { to: "/graph", label: "知识图谱", code: "谱" },
  { to: "/articles", label: "文章", code: "文" },
  { to: "/search", label: "搜索", code: "搜" },
  { to: "/issue", label: "问题反馈", code: "馈" },
];

export default function App() {
  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="brand-block">
          <div className="brand-mark">毛选</div>
          <div>
            <div className="brand">毛选知识库</div>
            <div className="brand-subtitle">知识时间线</div>
          </div>
        </div>
        <nav className="nav-list" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink to={item.to} key={item.to} end={item.to === "/"}>
              <span className="nav-code">{item.code}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-footer">
          <div className="side-status">
            <div className="status-dot" />
            <span>本地档案已连接</span>
          </div>
          <NavLink to="/disclaimer">免责声明</NavLink>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-topbar">
          <div>
            <div className="eyebrow">档案工作台</div>
            <div className="topbar-title">《毛泽东选集》知识可视化系统</div>
          </div>
          <NavLink className="issue-shortcut" to="/issue">
            提交问题
          </NavLink>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<GuidePage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/articles" element={<ArticlePage />} />
            <Route path="/articles/:id" element={<ArticlePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/issue" element={<IssuePage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
