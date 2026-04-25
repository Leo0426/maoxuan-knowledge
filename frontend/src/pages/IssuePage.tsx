import { FormEvent, useState } from "react";

type IssueForm = {
  title: string;
  type: string;
  priority: string;
  contact: string;
  description: string;
  steps: string;
};

const initialForm: IssueForm = {
  title: "",
  type: "缺陷",
  priority: "中",
  contact: "",
  description: "",
  steps: "",
};

export default function IssuePage() {
  const [form, setForm] = useState<IssueForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function updateField(key: keyof IssueForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const subject = `[毛选知识库问题反馈] ${form.title || "未命名"}`;
    const body = [
      `标题：${form.title || "未填写"}`,
      `类型：${form.type}`,
      `优先级：${form.priority}`,
      `联系方式：${form.contact || "未填写"}`,
      `当前页面：${window.location.href}`,
      "",
      "问题描述：",
      form.description || "未填写",
      "",
      "复现步骤 / 期望结果：",
      form.steps || "未填写",
    ].join("\n");
    window.location.href = `mailto:junlei0426@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <div className="page-inner">
      <section className="page-title">
        <div>
          <div className="eyebrow">问题反馈</div>
          <h1>提交问题</h1>
          <div className="muted">通过本机邮件客户端发送到 junlei0426@hotmail.com</div>
        </div>
      </section>
      <form className="panel issue-form" onSubmit={handleSubmit}>
        <label>
          标题
          <input value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
        </label>
        <div className="form-grid">
          <label>
            类型
            <select value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              <option>缺陷</option>
              <option>功能建议</option>
              <option>数据问题</option>
              <option>体验问题</option>
            </select>
          </label>
          <label>
            优先级
            <select value={form.priority} onChange={(event) => updateField("priority", event.target.value)}>
              <option>低</option>
              <option>中</option>
              <option>高</option>
              <option>紧急</option>
            </select>
          </label>
        </div>
        <label>
          联系方式
          <input value={form.contact} onChange={(event) => updateField("contact", event.target.value)} placeholder="邮箱或其他联系方式" />
        </label>
        <label>
          问题描述
          <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} rows={6} required />
        </label>
        <label>
          复现步骤 / 期望结果
          <textarea value={form.steps} onChange={(event) => updateField("steps", event.target.value)} rows={5} />
        </label>
        <div className="form-actions">
          <button type="submit">打开邮件草稿</button>
          {submitted && <span className="muted">已尝试打开邮件客户端。</span>}
        </div>
      </form>
    </div>
  );
}
