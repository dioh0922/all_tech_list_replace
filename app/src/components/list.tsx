import { techlist } from '../../db/migrations/schema.js'
import { BASE_PATH } from '../config.js'

type TechListProps = {
  allLists: (typeof techlist.$inferSelect)[]
}

export const List = ({ allLists, isLogIn }: TechListProps & { isLogIn: boolean }) => {
  return (
    <div>
      <div class="flex-between mb-4">
        <h2 class="card-title" style="margin-bottom: 0;">プロジェクト一覧</h2>
        <div class="actions">
          {!isLogIn && (
            <a href={`${BASE_PATH}/login`} class="btn btn-outline">ログイン</a>
          )}
          {isLogIn && (
            <div>
              <a href={`${BASE_PATH}/add`} class="btn btn-primary">新規プロジェクト追加</a>
              <a href={`${BASE_PATH}/vector`} class="btn btn-outline" title="ベクトル変換">変換</a>
              <a href={`${BASE_PATH}/ask`} class="btn btn-outline" title="分析">分析</a>
              <div class="dropdown">
                <button class="btn btn-outline">
                  <span class="material-symbols-outlined">download</span>
                  <span>ダウンロード</span>
                  <span class="material-symbols-outlined" style="font-size: 1rem; margin-left: -0.25rem;">expand_more</span>
                </button>
                <div class="dropdown-content">
                  <a href={`${BASE_PATH}/api/dump`} class="dropdown-item" download>
                    <span class="material-symbols-outlined">file_download</span>
                    JSONデータ
                  </a>
                  <a href={`${BASE_PATH}/api/dump/vector`} class="dropdown-item" download>
                    <span class="material-symbols-outlined">account_tree</span>
                    ベクトルデータ
                  </a>
                </div>
              </div>
              <a href={`${BASE_PATH}/logout`} class="btn btn-outline">ログアウト</a>
            </div>
          )}
        </div>
      </div>

      <div class="project-grid">
        {allLists.map((list) => (
          <div class="project-card" key={list.projectId}>
            <div class="card-header">
              <h3 class="project-name">{list.projectName}</h3>
              <span class="project-date">{new Date(list.createDate).toLocaleDateString('ja-JP')}</span>
            </div>
            
            <div class="card-body">
              <div class="tech-tags">
                {list.techName?.split(',').map(tech => (
                  <span class="tech-tag">{tech.trim()}</span>
                ))}
              </div>
            </div>

            <div class="card-footer">
              <div class="primary-links">
                {list.url && (
                  list.url === '廃止' ? (
                    <span class="icon-link-disabled" title="廃止">
                      <span class="material-symbols-outlined">block</span>
                    </span>
                  ) : (
                    <a href={list.url} target="_blank" rel="noopener noreferrer" class="icon-link" title="Open URL">
                      <span class="material-symbols-outlined">open_in_new</span>
                    </a>
                  )
                )}
                {list.repository && (
                  <a href={`https://github.com/dioh0922/${list.repository}`} target="_blank" rel="noopener noreferrer" class="icon-link" title="Repository">
                    <span class="material-symbols-outlined">code</span>
                  </a>
                )}
              </div>
              <div class="management-actions">
                <a href={`${BASE_PATH}/edit/${list.projectId}`} class="btn-icon" title="編集">
                  <span class="material-symbols-outlined">edit</span>
                </a>
                <form action={`${BASE_PATH}/delete/${list.projectId}`} method="post" onsubmit="return confirm('本当に削除しますか？')">
                  <button type="submit" class="btn-icon btn-icon-danger" title="削除">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
