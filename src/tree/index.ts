export interface ITreeNodeOptions<T> {
  id: string;
  parentId?: string | null;
  data: T;
}

class TreeNode<T> {
  public id: string;
  public data: T;
  public children: TreeNode<T>[];
  public parentId?: string | null;

  constructor(options: ITreeNodeOptions<T>) {
    this.id = options.id;
    this.data = options.data;
    this.parentId = options.parentId;
    this.children = [];
  }
}

export class Tree<T> {
  private rootNodes: TreeNode<T>[] = [];
  private nodesMap: Map<string, TreeNode<T>> = new Map();

  constructor(items?: ITreeNodeOptions<T>[]) {
    if (items) this.buildTreeFromArray(items);
  }

  // Создает дерево из массива узлов
  public buildTreeFromArray(items: ITreeNodeOptions<T>[]): void {
    items.forEach((item) => {
      const node = new TreeNode<T>(item);
      this.nodesMap.set(node.id, node);
    });

    items.forEach((item) => {
      const node = this.nodesMap.get(item.id)!;
      if (item.parentId == null) {
        this.rootNodes.push(node);
      } else {
        const parentNode = this.nodesMap.get(item.parentId);
        parentNode?.children.push(node);
      }
    });
  }

  // Метод для поиска узла по ID
  public findNodeById(id: string): TreeNode<T> | null {
    return this.nodesMap.get(id) ?? null;
  }

  // Метод для добавления узла в дерево
  public addNode(options: ITreeNodeOptions<T>): void {
    const node = new TreeNode<T>(options);
    this.nodesMap.set(node.id, node);

    if (options.parentId == null) {
      this.rootNodes.push(node);
    } else {
      const parentNode = this.nodesMap.get(options.parentId);
      parentNode?.children.push(node);
    }
  }

  // Метод для удаления узла по ID и всех его дочерних узлов
  public removeNode(id: string): boolean {
    const nodeToRemove = this.nodesMap.get(id);
    if (!nodeToRemove) return false;

    // Если удаляемый узел корневой
    if (this.rootNodes.includes(nodeToRemove)) {
      this.rootNodes = this.rootNodes.filter((node) => node.id !== id);
    } else {
      // Иначе ищем родительский узел и удаляем его из дочерних
      for (const node of this.nodesMap.values()) {
        node.children = node.children.filter((child) => child.id !== id);
      }
    }

    // Рекурсивное удаление всех дочерних узлов
    const deleteRecursively = (node: TreeNode<T>) => {
      node.children.forEach((child) => deleteRecursively(child));
      this.nodesMap.delete(node.id);
    };
    deleteRecursively(nodeToRemove);

    return true;
  }

  // Метод обхода дерева (DFS) и выполнения callback на каждом узле
  public traverseDFS(callback: (node: TreeNode<T>) => void): void {
    const traverse = (node: TreeNode<T>) => {
      callback(node);
      node.children.forEach(traverse);
    };
    this.rootNodes.forEach(traverse);
  }

  // Метод обхода дерева (BFS) и выполнения callback на каждом узле
  public traverseBFS(callback: (node: TreeNode<T>) => void): void {
    const queue: TreeNode<T>[] = [...this.rootNodes];
    while (queue.length) {
      const node = queue.shift()!;
      callback(node);
      queue.push(...node.children);
    }
  }

  // Метод для получения всех узлов в виде плоского массива
  public toArray(): TreeNode<T>[] {
    const result: TreeNode<T>[] = [];
    this.traverseDFS((node) => result.push(node));
    return result;
  }

  // Метод для поиска всех дочерних узлов конкретного узла
  public getDescendants(id: string): TreeNode<T>[] {
    const descendants: TreeNode<T>[] = [];
    const node = this.findNodeById(id);
    if (node) {
      this.traverseDFS((childNode) => {
        if (childNode !== node) descendants.push(childNode);
      });
    }
    return descendants;
  }

  // Метод для получения всех видимых узлов с учетом свернутых
  public getVisibleNodes(collapsedNodeIds: string[]): TreeNode<T>[] {
    const visibleNodes: TreeNode<T>[] = [];

    const traverse = (node: TreeNode<T>) => {
      visibleNodes.push(node);

      // Если узел свернут, не обходим его дочерние узлы
      if (!collapsedNodeIds.includes(`${node.id}`)) {
        node.children.forEach(traverse);
      }
    };

    this.rootNodes.forEach(traverse);
    return visibleNodes;
  }

  // Добавляем метод получения всех родительских узлов
  public getParentNodes(id: string): TreeNode<T>[] {
    const parentNodes: TreeNode<T>[] = [];
    const node = this.nodesMap.get(id);

    if (!node) {
      return parentNodes; // Если узел не найден, возвращаем пустой массив
    }

    // Функция для поиска родителя
    const findParent = (currentNode: TreeNode<T>): void => {
      if (currentNode.parentId != null) {
        const parentNode = this.nodesMap.get(currentNode.parentId);
        if (parentNode) {
          parentNodes.push(parentNode);
          findParent(parentNode); // Рекурсивный вызов для поиска дальше вверх
        }
      }
    };

    findParent(node); // Начинаем с указанного узла
    return parentNodes.reverse(); // Возвращаем массив в правильном порядке (от корня к узлу)
  }
}