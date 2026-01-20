import { Injectable, signal, computed, effect } from '@angular/core';
import { Board, List, Task } from '../models/board.model';
import { v4 as uuidv4 } from 'uuid';
import { IndexedDBService } from './indexeddb.service';
import { generateSampleData } from './sample-data.generator';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private _boards = signal<Board[]>([]);
  private _lists = signal<List[]>([]);
  private _tasks = signal<Task[]>([]);
  private _activeBoardId = signal<string | null>(null);
  private _searchQuery = signal<string>('');

  boards = this._boards.asReadonly();
  lists = this._lists.asReadonly();
  tasks = this._tasks.asReadonly();
  activeBoardId = this._activeBoardId.asReadonly();
  searchQuery = this._searchQuery.asReadonly();

  filteredTasks = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    const allTasks = this._tasks();

    if (!query) {
      return allTasks;
    }

    return allTasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  activeBoard = computed(() => {
    const boardId = this._activeBoardId();
    return boardId ? this._boards().find(b => b.id === boardId) : null;
  });

  activeBoardLists = computed(() => {
    const boardId = this._activeBoardId();
    return boardId ? this._lists().filter(l => l.boardId === boardId) : [];
  });

  activeBoardTasks = computed(() => {
    const boardId = this._activeBoardId();
    return boardId ? this._tasks().filter(t => t.boardId === boardId) : [];
  });

  constructor(private indexedDB: IndexedDBService) {
    this.initializeData();

    effect(() => {
      const state = {
        boards: this._boards(),
        lists: this._lists(),
        tasks: this._tasks(),
        activeBoardId: this._activeBoardId()
      };

      console.log('📊 Boards State Updated:', {
        boardsCount: state.boards.length,
        listsCount: state.lists.length,
        tasksCount: state.tasks.length,
        activeBoardId: state.activeBoardId,
        boards: state.boards
      });

      this.indexedDB.saveState(state).catch(err =>
        console.error('Failed to save state to IndexedDB:', err)
      );
    });
  }

  private async initializeData() {
    try {
      const savedState = await this.indexedDB.loadState();

      if (savedState && savedState.boards.length > 0) {
        console.log('✅ Loaded state from IndexedDB');
        this._boards.set(savedState.boards);
        this._lists.set(savedState.lists);
        this._tasks.set(savedState.tasks);
        this._activeBoardId.set(savedState.activeBoardId);
      } else {
        console.log('🎲 Generating sample data');
        const sampleData = generateSampleData();
        this._boards.set(sampleData.boards);
        this._lists.set(sampleData.lists);
        this._tasks.set(sampleData.tasks);
        this._activeBoardId.set(sampleData.boards[0]?.id || null);
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
      const sampleData = generateSampleData();
      this._boards.set(sampleData.boards);
      this._lists.set(sampleData.lists);
      this._tasks.set(sampleData.tasks);
      this._activeBoardId.set(sampleData.boards[0]?.id || null);
    }
  }

  getBoards = this._boards.asReadonly();

  setActiveBoardId(boardId: string | null) {
    this._activeBoardId.set(boardId);
  }

  setSearchQuery(query: string) {
    this._searchQuery.set(query);
  }

  addBoard(board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) {
    const newBoard: Board = {
      ...board,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this._boards.update(boards => [...boards, newBoard]);
    return newBoard;
  }

  updateBoard(id: string, updates: Partial<Omit<Board, 'id' | 'createdAt'>>) {
    this._boards.update(boards =>
      boards.map(board =>
        board.id === id
          ? { ...board, ...updates, updatedAt: new Date() }
          : board
      )
    );
  }

  deleteBoard(id: string) {
    this._boards.update(boards => boards.filter(board => board.id !== id));
    this._lists.update(lists => lists.filter(list => list.boardId !== id));
    this._tasks.update(tasks => tasks.filter(task => task.boardId !== id));

    if (this._activeBoardId() === id) {
      const remainingBoards = this._boards().filter(b => b.id !== id);
      this._activeBoardId.set(remainingBoards[0]?.id || null);
    }
  }

  getBoardById(id: string): Board | undefined {
    return this._boards().find(board => board.id === id);
  }

  addList(list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>) {
    const newList: List = {
      ...list,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this._lists.update(lists => [...lists, newList]);
    return newList;
  }

  updateList(id: string, updates: Partial<Omit<List, 'id' | 'boardId' | 'createdAt'>>) {
    this._lists.update(lists =>
      lists.map(list =>
        list.id === id
          ? { ...list, ...updates, updatedAt: new Date() }
          : list
      )
    );
  }

  deleteList(id: string) {
    this._lists.update(lists => lists.filter(list => list.id !== id));
    this._tasks.update(tasks => tasks.filter(task => task.listId !== id));
  }

  getListById(id: string): List | undefined {
    return this._lists().find(list => list.id === id);
  }

  getListsByBoardId(boardId: string): List[] {
    return this._lists().filter(list => list.boardId === boardId);
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this._tasks.update(tasks => [...tasks, newTask]);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    this._tasks.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  }

  deleteTask(id: string) {
    this._tasks.update(tasks => tasks.filter(task => task.id !== id));
  }

  getTaskById(id: string): Task | undefined {
    return this._tasks().find(task => task.id === id);
  }

  getTasksByListId(listId: string): Task[] {
    return this._tasks().filter(task => task.listId === listId);
  }

  getTasksByBoardId(boardId: string): Task[] {
    return this._tasks().filter(task => task.boardId === boardId);
  }

  moveTask(taskId: string, targetListId: string, position: number) {
    this._tasks.update(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? { ...task, listId: targetListId, position, updatedAt: new Date() }
          : task
      )
    );
  }

  reorderList(listId: string, newPosition: number) {
    this._lists.update(lists =>
      lists.map(list =>
        list.id === listId
          ? { ...list, position: newPosition, updatedAt: new Date() }
          : list
      )
    );
  }
}
