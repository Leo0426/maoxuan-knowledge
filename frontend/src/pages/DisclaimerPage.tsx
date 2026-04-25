export default function DisclaimerPage() {
  return (
    <div className="page-inner">
      <section className="page-title">
        <div>
          <div className="eyebrow">资料说明</div>
          <h1>免责声明</h1>
          <div className="muted">关于资料来源、知识抽取与使用边界的说明</div>
        </div>
      </section>

      <section className="panel disclaimer-panel">
        <h2>研究与学习用途</h2>
        <p>
          MaoXuan Knowledge Timeline 是一个面向文本阅读、知识整理与历史资料可视化的个人学习项目。
          页面中的时间线、地图、事件、人物、地点、关键词、知识图谱和检索结果，均用于辅助理解文本结构与历史语境，
          不构成权威史料发布、政治立场表达、学术定论或现实行动建议。
        </p>

        <h2>资料与抽取结果</h2>
        <p>
          本项目的数据可能来自公开文本、人工整理、脚本处理或 LLM 辅助抽取。自动抽取结果可能存在遗漏、误判、
          时间归并不准确、实体关联不完整等情况。涉及重要事实、日期、引文和历史判断时，请以正式出版物、
          原始文献和可靠研究资料为准。
        </p>

        <h2>版权与引用</h2>
        <p>
          项目中展示的原文片段仅用于学习、研究、索引和可视化演示。若后续接入更完整文本或外部资料，
          使用者应自行确认相关版权、授权和引用规范，并在公开传播或二次使用时遵守适用法律法规。
        </p>

        <h2>用户责任</h2>
        <p>
          使用者应以审慎、批判和尊重历史语境的方式阅读本项目内容。因依赖本项目自动整理结果而产生的理解偏差、
          引用错误或其他后果，由使用者自行判断和承担。
        </p>
      </section>
    </div>
  );
}
