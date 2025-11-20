import { useAppStore } from '../store/useAppStore';
import '../App.css';

export function AdminChecklistsPage() {
  const { checklistTemplates } = useAppStore();
  const template = checklistTemplates[0];

  if (!template) {
    return (
      <div className="page">
        <div className="page-title">Чеклисты</div>
        <p style={{ color: 'var(--text-secondary)' }}>Нет данных чеклиста</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-bar">
        <span className="page-title">Чеклисты</span>
        <span className="chip chip--ghost">{template.name}</span>
        <span className="chip chip--ghost">v{template.version}</span>
      </div>

      <div className="table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Секция</th>
              <th>Пункты</th>
            </tr>
          </thead>
          <tbody>
            {template.sections.map((section) => (
              <tr key={section.id}>
                <td style={{ width: '260px' }}>
                  <strong>{section.title}</strong>
                </td>
                <td>
                  <div className="section">
                    {section.items.map((item) => (
                      <div key={item.id} className="badge">
                        <span className="badge__dot" />
                        {item.label} — {item.type}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
