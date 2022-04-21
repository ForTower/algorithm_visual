const lt = "<text decode='true'>&lt;</text>"
//反斜杠
const i = "<text decode='true'>\\</text>"

const text = `<pre>package datastruct.java_coding;

class AVLTree{
    private AVLTNode root;

    private class AVLTNode{
        private int value;
        //节点的高度
        private int height;
        private AVLTNode left;
        private AVLTNode right;
        private AVLTNode parent;

        public AVLTNode(int value){
            this.value = value;
            //每一个节点的初始高度都为1
            this.height = 1;
        }
    }

    //返回平衡二叉树的根节点
    public AVLTNode getRoot(){
        return root;
    }

    public void insert(int value){
        AVLTNode newNode = new AVLTNode(value);
        if (root == null) {
            root = newNode;
            return;
        }
        AVLTNode cur = root;
        AVLTNode p = cur;
        //寻找插入的位置
        while (cur != null) {
            p = cur;
            if (cur.value > value) {
                cur = cur.left;
            } else if (cur.value == value) {
                System.out.println(value + "在平衡二叉树中已经存在，插入失败。");
                return;
            }else {
                cur = cur.right;
            }
        }
        //把newNode节点插入到合适的位置
        if (p.value > value) {
            p.left = newNode;
        }else {
            p.right = newNode;
        }
        newNode.parent = p;
        //插入后调整
        fixAfterInsert(parentOf(newNode));
    }

    private void fixAfterInsert(AVLTNode x) {
        //沿父亲节点依次检查是否平衡，并更新高度
        while (x != null) {
            if (isBalance(x)) {
                updateHeight(x);
            }else {
                reBalanced(x);
                break;
            }
            x = parentOf(x);
        }
    }

    //从二叉搜索树中删除值为value的节点
    public void delete(int value){
        //在二叉搜索树中寻找值为value的节点
        AVLTNode node = findNode(value);
        if (node == null){
            System.out.println("二叉搜索树不存在值为" + value + "的节点，删除失败。");
            return;
        }
        //node为要删除的值
        //节点node的左右节点都存在，将node节点的后继节点s
        // 即大于node节点值的最小节点，即node节点的右子树中最左边的一个节点，将s中的值拷贝到node中，然后删除s
        // 此时s最多只有右子树
        if (node.left != null && node.right != null){
            AVLTNode s = successor(node);
            node.value = s.value;
            node = s;
        }

        // replacement表示替代被删除节点的节点，node节点被删除了，只能用其子节点代替
        // 经过上面的转换，node要么没有子节点，要么只有一个子节点
        AVLTNode replacement = node.left == null ? node.right : node.left;
        if (replacement == null){
            //无替换节点，也就是node没有左节点和右节点，直接删除即可
            //AVL树只有根节点，删除后，AVL树为空树
            if (node == root){
                root = null;
            }else {
                //删除父节点对node节点的引用
                if (node.parent.left == node){
                    node.parent.left = null;
                }else {
                    node.parent.right = null;
                }
                //删除node节点对父节点的引用，使node节点处于游离状态，很快被垃圾回收机制回收
                AVLTNode parent = node.parent;
                node.parent = null;
                //删除后调整平衡
                fixAfterDelete(parent);
            }

        }else {
            // 设置replacement的父节点
            replacement.parent = node.parent;
            //node有一个子节点
            //删除的是根节点
            if (node.parent == null){
                root = replacement;
            }else if (node.parent.left == node){
                //node为其父节点的左节点，用replacement代替node
                node.parent.left = replacement;
            }else {
                //node为其父节点的右节点，用replacement代替node
                node.parent.right = replacement;
            }
            //删除node节点对其左孩子节点或右孩子节点和父节点的引用
            node.left = node.right = node.parent = null;
            //删除后调整平衡
            fixAfterDelete(parentOf(replacement));
        }
    }

    //删除后调整
    private void fixAfterDelete(AVLTNode x) {
        while (x != null) {
            if (isBalance(x)) {
                updateHeight(x);
            }else {
                reBalanced(x);
            }
            x = parentOf(x);
        }
    }

    //通过旋转再次达到平衡
    private void reBalanced(AVLTNode x) {
        //x的孩子节点
        AVLTNode x_child = tallerChild(x);
        //如果x_child是x的左孩子，x的左子树比x的右子树高
        if ( x_child == leftOf(x)) {
            //LL型，以x为支点右旋转（单旋转）
            if (tallerChild(x_child) == leftOf(x_child)) {
                rightRotate(x);
            }
            //LR型，先以x_child为支点左旋转，再以x为支点右旋转（双旋转）
            else {
                leftRotate(x_child);
                rightRotate(x);
            }
        }else {
            //x_child是x的右孩子，x的右子树比x的左子树高
            if (tallerChild(x_child) == leftOf(x_child)) {
                //RL型，先以x_child为支点右旋转，再以x为支点左旋转(双旋转）
                rightRotate(x_child);
                leftRotate(x);
            }else {
                //RR型，以x为支点左旋转
                leftRotate(x);
            }
        }
    }


    //返回node节点的后继节点
    private AVLTNode successor(AVLTNode node) {
        AVLTNode mostLeft = node.right;
        while (mostLeft != null && mostLeft.left != null) {
            mostLeft = mostLeft.left;
        }
        return mostLeft;
    }

    //返回值为value的节点
    private AVLTNode findNode(int value) {
        AVLTNode cur = root;
        while (cur != null) {
            if (cur.value > value) {
                cur = cur.left;
            } else if (cur.value == value) {
                return cur;
            } else {
                cur = cur.right;
            }
        }
        return null;
    }

    //以pivot为支点进行左旋转
    //      pivot                   right
    //      /   ${i}                   /    ${i}
    //        right   左旋     pivot
    //        /   ${i}            /  ${i}
    private void leftRotate(AVLTNode pivot) {
        AVLTNode right = pivot.right;
        pivot.right = right.left;
        if (right.left != null) {
            right.left.parent = pivot;
        }
        if (pivot.parent == null) {
            //根节点为支点
            root = right;
        } else if (pivot.parent.left == pivot) {
            pivot.parent.left = right;
        } else {
            pivot.parent.right = right;
        }
        right.parent = pivot.parent;
        right.left = pivot;
        pivot.parent = right;
        //更新高度
        updateHeight(pivot);
        updateHeight(parentOf(pivot));
    }

    //以pivot为支点进行右旋转
    //        pivot               left
    //        /   ${i}               /   ${i}
    //     left         右旋           pivot
    //    /   ${i}                        /   ${i}
    private void rightRotate(AVLTNode pivot) {
        AVLTNode left = pivot.left;
        pivot.left = left.right;
        if (left.right != null) {
            left.right.parent = pivot;
        }
        if (pivot.parent == null) {
            //根节点为支点
            root = left;
        } else if (pivot.parent.left == pivot) {
            pivot.parent.left = left;
        } else {
            pivot.parent.right = left;
        }
        left.parent = pivot.parent;
        left.right = pivot;
        pivot.parent = left;
        //更新高度
        updateHeight(pivot);
        updateHeight(parentOf(pivot));
    }

    //返回child节点的父节点
    private AVLTNode parentOf(AVLTNode child) {
        return child == null ? null : child.parent;
    }

    //返回parent节点的左孩子节点
    private AVLTNode leftOf(AVLTNode parent) {
        return parent == null ? null : parent.left;
    }

    //返回parent节点的右孩子节点
    private AVLTNode rightOf(AVLTNode parent) {
        return parent == null ? null : parent.right;
    }

    //返回node节点的高度
    private int getHeight(AVLTNode node) {
        int leftHeight = leftHeight(node);
        int rightHeight = rightHeight(node);
        return Math.max(leftHeight, rightHeight) + 1;
    }

    //返回较高的子树
    private AVLTNode tallerChild(AVLTNode node) {
        int leftHeight = leftHeight(node);
        int rightHeight = rightHeight(node);
        return leftHeight > rightHeight ? node.left : node.right;
    }

    //返回parent节点的左孩子的高度
    private int leftHeight(AVLTNode parent) {
        return parent.left == null ? 0 : parent.left.height;
    }

    //返回parent节点的右孩子的高度
    private int rightHeight(AVLTNode parent) {
        return parent.right == null ? 0 : parent.right.height;
    }

    //检查node节点是否平衡
    private boolean isBalance(AVLTNode node){
        int leftHeight = leftHeight(node);
        int rightHeight = rightHeight(node);
        return Math.abs(leftHeight - rightHeight) ${lt}= 1;
    }

    //更新node节点的高度
    private void updateHeight(AVLTNode node) {
        node.height = getHeight(node);
    }

    //中序遍历
    public void inOrder(AVLTNode cur){
        if (cur == null){
            return;
        }
        inOrder(cur.left);
        System.out.print(cur.value + "(h:" + cur.height + ") ");
        inOrder(cur.right);
    }

}

public class AVLTreeCoding {
    public static void main(String[] args) {
        AVLTree avlTree = new AVLTree();
        int [] arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        for (int value: arr){
            avlTree.insert(value);
        }
        //avlTree.inOrder(avlTree.getRoot());
        //输出结果为：
        // 1(h:1) 2(h:2) 3(h:1) 4(h:4) 5(h:1) 6(h:2) 7(h:1) 8(h:3) 9(h:2) 10(h:1)
        //满足要求
        avlTree.delete(8);
        // avlTree.inOrder(avlTree.getRoot());
        //输出结果为
        // 1(h:1) 2(h:2) 3(h:1) 4(h:4) 5(h:1) 6(h:2) 7(h:1) 9(h:3) 10(h:1)
        avlTree.delete(10);
        avlTree.delete(4);
        avlTree.delete(1);
        avlTree.inOrder(avlTree.getRoot());
        //输出结果为
        // 2(h:2) 3(h:1) 5(h:3) 6(h:1) 7(h:2) 9(h:1)
    }
}</pre>
`

const coding = `package datastruct.java_coding;

class AVLTree {
    private AVLTNode root;

    private class AVLTNode {
        private int value;
        //节点的高度
        private int height;
        private AVLTNode left;
        private AVLTNode right;
        private AVLTNode parent;

        public AVLTNode(int value) {
            this.value = value;
            //每一个节点的初始高度都为1
            this.height = 1;
        }
    }

    //返回平衡二叉树的根节点
    public AVLTNode getRoot() {
        return root;
    }

    public void insert(int value) {
        AVLTNode newNode = new AVLTNode(value);
        if (root == null) {
            root = newNode;
            return;
        }
        AVLTNode cur = root;
        AVLTNode p = cur;
        //寻找插入的位置
        while (cur != null) {
            p = cur;
            if (cur.value > value) {
                cur = cur.left;
            } else if (cur.value == value) {
                System.out.println(value + "在平衡二叉树中已经存在，插入失败。");
                return;
            } else {
                cur = cur.right;
            }
        }
        //把newNode节点插入到合适的位置
        if (p.value > value) {
            p.left = newNode;
        } else {
            p.right = newNode;
        }
        newNode.parent = p;
        //插入后调整
        fixAfterInsert(parentOf(newNode));
    }

    private void fixAfterInsert(AVLTNode x) {
        //沿父亲节点依次检查是否平衡，并更新高度
        while (x != null) {
            if (isBalance(x)) {
                updateHeight(x);
            } else {
                reBalanced(x);
                break;
            }
            x = parentOf(x);
        }
    }

    //从二叉搜索树中删除值为value的节点
    public void delete(int value) {
        //在二叉搜索树中寻找值为value的节点
        AVLTNode node = findNode(value);
        if (node == null) {
            System.out.println("二叉搜索树不存在值为" + value + "的节点，删除失败。");
            return;
        }
        //node为要删除的值
        //节点node的左右节点都存在，将node节点的后继节点s
        // 即大于node节点值的最小节点，即node节点的右子树中最左边的一个节点，将s中的值拷贝到node中，然后删除s
        // 此时s最多只有右子树
        if (node.left != null && node.right != null) {
            AVLTNode s = successor(node);
            node.value = s.value;
            node = s;
        }

        // replacement表示替代被删除节点的节点，node节点被删除了，只能用其子节点代替
        // 经过上面的转换，node要么没有子节点，要么只有一个子节点
        AVLTNode replacement = node.left == null ? node.right : node.left;
        if (replacement == null) {
            //无替换节点，也就是node没有左节点和右节点，直接删除即可
            //AVL树只有根节点，删除后，AVL树为空树
            if (node == root) {
                root = null;
            } else {
                //删除父节点对node节点的引用
                if (node.parent.left == node) {
                    node.parent.left = null;
                } else {
                    node.parent.right = null;
                }
                //删除node节点对父节点的引用，使node节点处于游离状态，很快被垃圾回收机制回收
                AVLTNode parent = node.parent;
                node.parent = null;
                //删除后调整平衡
                fixAfterDelete(parent);
            }

        } else {
            // 设置replacement的父节点
            replacement.parent = node.parent;
            //node有一个子节点
            //删除的是根节点
            if (node.parent == null) {
                root = replacement;
            } else if (node.parent.left == node) {
                //node为其父节点的左节点，用replacement代替node
                node.parent.left = replacement;
            } else {
                //node为其父节点的右节点，用replacement代替node
                node.parent.right = replacement;
            }
            //删除node节点对其左孩子节点或右孩子节点和父节点的引用
            node.left = node.right = node.parent = null;
            //删除后调整平衡
            fixAfterDelete(parentOf(replacement));
        }
    }

    //删除后调整
    private void fixAfterDelete(AVLTNode x) {
        while (x != null) {
            if (isBalance(x)) {
                updateHeight(x);
            } else {
                reBalanced(x);
            }
            x = parentOf(x);
        }
    }

    //通过旋转再次达到平衡
    private void reBalanced(AVLTNode x) {
        //x的孩子节点
        AVLTNode x_child = tallerChild(x);
        //如果x_child是x的左孩子，x的左子树比x的右子树高
        if (x_child == leftOf(x)) {
            //LL型，以x为支点右旋转（单旋转）
            if (tallerChild(x_child) == leftOf(x_child)) {
                rightRotate(x);
            }
            //LR型，先以x_child为支点左旋转，再以x为支点右旋转（双旋转）
            else {
                leftRotate(x_child);
                rightRotate(x);
            }
        } else {
            //x_child是x的右孩子，x的右子树比x的左子树高
            if (tallerChild(x_child) == leftOf(x_child)) {
                //RL型，先以x_child为支点右旋转，再以x为支点左旋转(双旋转）
                rightRotate(x_child);
                leftRotate(x);
            } else {
                //RR型，以x为支点左旋转
                leftRotate(x);
            }
        }
    }


    //返回node节点的后继节点
    private AVLTNode successor(AVLTNode node) {
        AVLTNode mostLeft = node.right;
        while (mostLeft != null && mostLeft.left != null) {
            mostLeft = mostLeft.left;
        }
        return mostLeft;
    }

    //返回值为value的节点
    private AVLTNode findNode(int value) {
        AVLTNode cur = root;
        while (cur != null) {
            if (cur.value > value) {
                cur = cur.left;
            } else if (cur.value == value) {
                return cur;
            } else {
                cur = cur.right;
            }
        }
        return null;
    }

    //以pivot为支点进行左旋转
    //      pivot                   right
    //      /   \\                   /    \\
    //        right   左旋     pivot
    //        /   \\            /  \\
    private void leftRotate(AVLTNode pivot) {
        AVLTNode right = pivot.right;
        pivot.right = right.left;
        if (right.left != null) {
            right.left.parent = pivot;
        }
        if (pivot.parent == null) {
            //根节点为支点
            root = right;
        } else if (pivot.parent.left == pivot) {
            pivot.parent.left = right;
        } else {
            pivot.parent.right = right;
        }
        right.parent = pivot.parent;
        right.left = pivot;
        pivot.parent = right;
        //更新高度
        updateHeight(pivot);
        updateHeight(parentOf(pivot));
    }

    //以pivot为支点进行右旋转
    //        pivot               left
    //        /   \\               /   \\
    //     left         右旋           pivot
    //    /   \\                        /   \\
    private void rightRotate(AVLTNode pivot) {
        AVLTNode left = pivot.left;
        pivot.left = left.right;
        if (left.right != null) {
            left.right.parent = pivot;
        }
        if (pivot.parent == null) {
            //根节点为支点
            root = left;
        } else if (pivot.parent.left == pivot) {
            pivot.parent.left = left;
        } else {
            pivot.parent.right = left;
        }
        left.parent = pivot.parent;
        left.right = pivot;
        pivot.parent = left;
        //更新高度
        updateHeight(pivot);
        updateHeight(parentOf(pivot));
    }

    //返回child节点的父节点
    private AVLTNode parentOf(AVLTNode child) {
        return child == null ? null : child.parent;
    }

    //返回parent节点的左孩子节点
    private AVLTNode leftOf(AVLTNode parent) {
        return parent == null ? null : parent.left;
    }

    //返回parent节点的右孩子节点
    private AVLTNode rightOf(AVLTNode parent) {
        return parent == null ? null : parent.right;
    }

    //返回node节点的高度
    private int getHeight(AVLTNode node) {
        int leftHeight = leftHeight(node);
        int rightHeight = rightHeight(node);
        return Math.max(leftHeight, rightHeight) + 1;
    }

    //返回较高的子树
    private AVLTNode tallerChild(AVLTNode node) {
        int leftHeight = leftHeight(node);
        int rightHeight = rightHeight(node);
        return leftHeight > rightHeight ? node.left : node.right;
    }

    //返回parent节点的左孩子的高度
    private int leftHeight(AVLTNode parent) {
        return parent.left == null ? 0 : parent.left.height;
    }

    //返回parent节点的右孩子的高度
    private int rightHeight(AVLTNode parent) {
        return parent.right == null ? 0 : parent.right.height;
    }

    //检查node节点是否平衡
    private boolean isBalance(AVLTNode node) {
        int leftHeight = leftHeight(node);
        int rightHeight = rightHeight(node);
        return Math.abs(leftHeight - rightHeight) <= 1;
    }

    //更新node节点的高度
    private void updateHeight(AVLTNode node) {
        node.height = getHeight(node);
    }

    //中序遍历
    public void inOrder(AVLTNode cur) {
        if (cur == null) {
            return;
        }
        inOrder(cur.left);
        System.out.print(cur.value + "(h:" + cur.height + ") ");
        inOrder(cur.right);
    }
}

public class AVLTreeCoding {
    public static void main(String[] args) {
        AVLTree avlTree = new AVLTree();
        int[] arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        for (int value : arr) {
            avlTree.insert(value);
        }
        //avlTree.inOrder(avlTree.getRoot());
        //输出结果为：
        // 1(h:1) 2(h:2) 3(h:1) 4(h:4) 5(h:1) 6(h:2) 7(h:1) 8(h:3) 9(h:2) 10(h:1)
        //满足要求
        avlTree.delete(8);
        // avlTree.inOrder(avlTree.getRoot());
        //输出结果为
        // 1(h:1) 2(h:2) 3(h:1) 4(h:4) 5(h:1) 6(h:2) 7(h:1) 9(h:3) 10(h:1)
        avlTree.delete(10);
        avlTree.delete(4);
        avlTree.delete(1);
        avlTree.inOrder(avlTree.getRoot());
        //输出结果为
        // 2(h:2) 3(h:1) 5(h:3) 6(h:1) 7(h:2) 9(h:1)
    }
}
`

Page({
    data: {
        text
    },
    copy() {
        wx.setClipboardData({
            data: coding,
            success: function () {
                wx.showToast({
                    title: '复制成功',
                    icon: 'none',
                    duration: 500
                })
            }
        });
    },

})