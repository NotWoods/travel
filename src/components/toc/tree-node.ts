export interface TreeNode {
  children: readonly TreeNode[];
  slug: string;
  text: string;
}

export interface MutableTreeNode extends TreeNode {
  children: MutableTreeNode[];
}
