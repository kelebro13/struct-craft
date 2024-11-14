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

  // Метод для добавления узла в дерево
  public add(options: ITreeNodeOptions<T>): void {
    const node = new TreeNode<T>(options);
    this.nodesMap.set(node.id, node);

    if (options.parentId == null) {
      this.rootNodes.push(node);
    } else {
      const parentNode = this.nodesMap.get(options.parentId);
      parentNode?.children.push(node);
    }
  }

  // Метод для поиска узла по ID
  public find(id: string): TreeNode<T> | null {
    return this.nodesMap.get(id) ?? null;
  }

  public findParent(id: string): TreeNode<T> | null {
    const node = this.nodesMap.get(id);
    if (!node) {
      return null;
    }

    if (node.parentId == null) {
      return null;
    }

    return this.nodesMap.get(node.parentId) ?? null;
  }

  // Возвращает корневой узел
  public getRoot (): TreeNode<T> | null {
    return this.rootNodes[0] ?? null;
  }

  // Возвращает массив дочерних узлов для заданного узла
  public getChildren(id: string): TreeNode<T>[] | null {
    const node = this.nodesMap.get(id);
    return node?.children ?? null;
  }

  // Возвращает всех предков заданного узла, вплоть до корня
  public getAncestors(id: string): TreeNode<T>[] {
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

  // Возвращает всех потомков узла (рекурсивно вниз по дереву)
  public getDescendants(id: string): TreeNode<T>[] {
    const descendants: TreeNode<T>[] = [];
    const node = this.find(id);
    if (node) {
      this.traverseDFS((childNode) => {
        if (childNode !== node) descendants.push(childNode);
      });
    }
    return descendants;
  }

  // Метод для удаления узла по ID и всех его дочерних узлов
  public delete(id: string): boolean {
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

  // Перемещает узел в новое место, изменяя его родителя
  public move(id: string, newParentId: string): boolean {
    const node = this.nodesMap.get(id);
    if (!node) return false; // Узел не найден

    const currentParentId = node.parentId;
    if (currentParentId === newParentId) return true; // Ничего не меняем, если новый и текущий родитель одинаковы

    // Удаляем узел из дочерних текущего родителя
    if (currentParentId != null) {
      const currentParent = this.nodesMap.get(currentParentId);
      if (currentParent) {
        currentParent.children = currentParent.children.filter(child => child.id !== id);
      }
    } else {
      // Если это корневой узел, удаляем его из rootNodes
      this.rootNodes = this.rootNodes.filter(rootNode => rootNode.id !== id);
    }

    // Добавляем узел в дочерние к новому родителю
    if (newParentId == null) {
      this.rootNodes.push(node);
    } else {
      const newParent = this.nodesMap.get(newParentId);
      if (newParent) {
        newParent.children.push(node);
      } else {
        return false; // Новый родитель не найден
      }
    }

    node.parentId = newParentId;
    return true;
  }

  // Обновляет значение узла
  public update(id: string, newValue: T): boolean {
    const node = this.nodesMap.get(id);
    if (!node) return false;

    node.data = newValue;
    return true;
  }

  // Возвращает глубину узла (количество шагов до корня)
  public getDepth(id: string): number {
    let depth = 0;
    let node = this.nodesMap.get(id);

    while (node && node.parentId != null) {
      depth++;
      node = this.nodesMap.get(node.parentId);
    }

    return depth;
  }

  // Возвращает высоту дерева (длина самого длинного пути от корня до листа).
  public getHeight(): number {
    let maxDepth = 0;

    const calculateHeight = (node: TreeNode<T>, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      node.children.forEach(child => calculateHeight(child, depth + 1));
    };

    this.rootNodes.forEach(rootNode => calculateHeight(rootNode, 1));
    return maxDepth;
  }

  // Возвращает общее количество узлов в дереве.
  public getSize(): number {
    return this.nodesMap.size;
  }

  // Проверяет, является ли узел листом (т.е., не имеет дочерних элементов).
  public isLeaf(id: string): boolean {
    const node = this.nodesMap.get(id);
    return node ? node.children.length === 0 : false;
  }

  // Проверяет, является ли узел корневым.
  public isRoot(id: string): boolean {
    return this.rootNodes.some(rootNode => rootNode.id === id);
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

  // Метод для получения всех видимых узлов с учетом свернутых
  public getVisibleNodes(collapsedNodeIds: string[] | Set<string>): TreeNode<T>[] {
    const collapsedNodeIdsSet = collapsedNodeIds instanceof Set ? collapsedNodeIds : new Set(collapsedNodeIds);

    const visibleNodes: TreeNode<T>[] = [];

    const traverse = (node: TreeNode<T>) => {
      visibleNodes.push(node);

      // Если узел свернут, не обходим его дочерние узлы
      if (!collapsedNodeIdsSet.has(`${node.id}`)) {
        node.children.forEach(traverse);
      }
    };

    this.rootNodes.forEach(traverse);
    return visibleNodes;
  }
}