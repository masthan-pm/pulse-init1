import { v4 as uuidv4 } from 'uuid';
import { Board, List, Task } from '../models/board.model';

export interface SampleData {
  boards: Board[];
  lists: List[];
  tasks: Task[];
}

export function generateSampleData(): SampleData {
  const boards: Board[] = [];
  const lists: List[] = [];
  const tasks: Task[] = [];

  const boardConfigs = [
    { name: 'Product Development', color: '#3b82f6', description: 'Q1 2024 product roadmap and development tasks' },
    { name: 'Marketing Campaign', color: '#8b5cf6', description: 'Launch campaign for new product line' },
    { name: 'Design System', color: '#ec4899', description: 'Component library and design tokens' }
  ];

  const listNames = [
    'Backlog', 'To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Blocked', 'Archive'
  ];

  const taskTemplates = [
    { title: 'Research competitor features', priority: 'high', tags: ['research', 'analysis'] },
    { title: 'Design user onboarding flow', priority: 'high', tags: ['design', 'ux'] },
    { title: 'Implement authentication module', priority: 'high', tags: ['development', 'security'] },
    { title: 'Write API documentation', priority: 'medium', tags: ['documentation', 'api'] },
    { title: 'Setup CI/CD pipeline', priority: 'high', tags: ['devops', 'automation'] },
    { title: 'Create landing page mockups', priority: 'medium', tags: ['design', 'marketing'] },
    { title: 'Conduct user interviews', priority: 'high', tags: ['research', 'user-testing'] },
    { title: 'Optimize database queries', priority: 'medium', tags: ['development', 'performance'] },
    { title: 'Update brand guidelines', priority: 'low', tags: ['design', 'branding'] },
    { title: 'Fix responsive layout issues', priority: 'medium', tags: ['development', 'bug'] },
    { title: 'Plan sprint retrospective', priority: 'low', tags: ['planning', 'team'] },
    { title: 'Implement dark mode', priority: 'medium', tags: ['development', 'feature'] },
    { title: 'Write unit tests', priority: 'high', tags: ['development', 'testing'] },
    { title: 'Review pull requests', priority: 'medium', tags: ['code-review', 'team'] },
    { title: 'Update dependencies', priority: 'low', tags: ['maintenance', 'security'] },
    { title: 'Create email templates', priority: 'medium', tags: ['design', 'marketing'] },
    { title: 'Setup error monitoring', priority: 'high', tags: ['devops', 'monitoring'] },
    { title: 'Refactor legacy code', priority: 'low', tags: ['development', 'technical-debt'] },
    { title: 'Design notification system', priority: 'medium', tags: ['design', 'feature'] },
    { title: 'Prepare demo presentation', priority: 'high', tags: ['presentation', 'stakeholder'] },
    { title: 'Analyze user metrics', priority: 'medium', tags: ['analytics', 'data'] },
    { title: 'Create style guide', priority: 'low', tags: ['design', 'documentation'] },
    { title: 'Implement search functionality', priority: 'high', tags: ['development', 'feature'] },
    { title: 'Setup analytics tracking', priority: 'medium', tags: ['analytics', 'tracking'] },
    { title: 'Optimize bundle size', priority: 'low', tags: ['development', 'performance'] }
  ];

  const statuses: Task['status'][] = ['todo', 'in-progress', 'done'];
  const descriptions = [
    'This task requires careful planning and execution.',
    'Priority item that needs immediate attention.',
    'Technical implementation with multiple dependencies.',
    'User-facing feature that impacts customer experience.',
    'Internal tool improvement for team efficiency.'
  ];

  boardConfigs.forEach((boardConfig, boardIndex) => {
    const board: Board = {
      id: uuidv4(),
      name: boardConfig.name,
      color: boardConfig.color,
      description: boardConfig.description,
      createdAt: new Date(Date.now() - (30 - boardIndex * 10) * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    boards.push(board);

    listNames.forEach((listName, listIndex) => {
      const list: List = {
        id: uuidv4(),
        boardId: board.id,
        name: listName,
        position: listIndex,
        createdAt: new Date(Date.now() - (25 - listIndex) * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      lists.push(list);
    });

    const boardLists = lists.filter(l => l.boardId === board.id);
    const tasksPerBoard = Math.floor(25 / boards.length) + (boardIndex === 0 ? 25 % boards.length : 0);

    for (let i = 0; i < tasksPerBoard; i++) {
      const template = taskTemplates[i % taskTemplates.length];
      const randomList = boardLists[Math.floor(Math.random() * Math.min(6, boardLists.length))];
      const daysAgo = Math.floor(Math.random() * 20) + 1;

      const task: Task = {
        id: uuidv4(),
        listId: randomList.id,
        boardId: board.id,
        title: `${template.title} - ${board.name}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        priority: template.priority as Task['priority'],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        tags: template.tags,
        dueDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.floor(daysAgo / 2) * 24 * 60 * 60 * 1000),
        position: i
      };
      tasks.push(task);
    }
  });

  return { boards, lists, tasks };
}
