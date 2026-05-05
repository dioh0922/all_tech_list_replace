 > このUIを「カード型ダッシュボード」として再設計してください。

   単なる一覧ではなく、
   「どのプロジェクトを触るか判断しやすいUI」にしてください。

   以下も考慮してください：
   - 重要な情報の優先順位付け
   - 視線誘導（タイトル → 技術 → 操作）
   - 操作しやすいUI配置（ボタン位置・クリック領域）

   必要であれば情報の追加・削除・再構成を行ってください。

# UI Redesign: Card-Based Dashboard Plan

Redesign the project list from a static table to a dynamic card-based dashboard to enhance scannability and decision-making.

## 1. Background & Motivation
The current table-based UI is functional but lacks visual hierarchy, making it difficult to quickly distinguish between projects at a glance. A card-based layout will provide a clearer overview of each project's technology stack and accessibility.

## 2. Scope & Impact
- **Affected Components**: `app/src/components/list.tsx`, `app/src/style.css`.
- **User Impact**: Improved project identification, easier navigation on mobile devices, and more intuitive access to project links (URL/Repository).

## 3. Proposed Solution

### Visual Hierarchy & Information Architecture
1.  **Grid Layout**: Use CSS Grid for a responsive multi-column layout.
2.  **Card Header**: Bold `projectName` as the primary anchor.
3.  **Metadata**: Display `createDate` in a subtle font style.
4.  **Tech Chips**: Transform `techName` into distinct visual tags to highlight core technologies.
5.  **Interactive Footer**: Group primary links (Open URL, View Code) and secondary actions (Edit, Delete) clearly.

## 4. Implementation Plan

### Phase 1: Structure Update (`src/components/list.tsx`)
- Replace the `<table>` and `<tr>` structure with a `div` grid container.
- Map projects to card elements.
- Use Material Symbols for URL and Repository links to save space while maintaining clarity.

### Phase 2: Style Overhaul (`src/style.css`)
- **Dashboard Grid**: Define `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`.
- **Card Design**:
    - Add background color, soft borders, and shadow.
    - Implement a `transform: translateY(-4px)` effect on hover.
- **Action Grouping**: Use flexbox to separate "Links" (left) from "Management" (right) in the card footer.
- **Responsiveness**: Ensure the container scales down to a single column on mobile.

### Phase 3: Cleanup
- Remove unused table-related CSS classes (`.table-container`, `th`, `td`, etc.).
- Update `layout.tsx` CSS versioning to bypass cache if necessary.

## 5. Verification
- **Visual Check**: Verify grid alignment and card spacing.
- **Functionality**: Ensure all links (URL/Repository) and actions (Edit/Delete/Add/Logout) function correctly.
- **Responsive Test**: Test layout on desktop and mobile viewports.
