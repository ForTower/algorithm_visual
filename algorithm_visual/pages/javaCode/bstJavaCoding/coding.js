const coding = `package datastruct.java_coding;

class TreeNode{
    public int value;
    public TreeNode left;
    public TreeNode right;
    public TreeNode parent;

    public TreeNode(int value){
        this.value = value;
    }
}

class BinarySearchTree{
    public TreeNode root;

    public void insert(int value){
        TreeNode newNode = new TreeNode(value);
        if (root == null){
            root = newNode;
            return;
        }
        TreeNode cur = root;
        TreeNode parent = cur;
        //寻找要插入的位置
        while (cur != null){
            parent = cur;
            if (cur.value > value){
                cur = cur.left;
            }else if (cur.value == value){
                System.out.println(value + "已经存在，插入失败。");
                return;
            }else {
                cur = cur.right;
            }
        }
        //将节点插入到相应的位置
        if (parent.value > value){
            parent.left = newNode;
        }else {
            parent.right = newNode;
        }
        //设置newNode的父亲为parent
        newNode.parent = parent;
    }

    //获取node节点的后继节点
    public TreeNode successor(TreeNode node){
        if (node == null){
            return null;
        }
        TreeNode mostLeft = node.right;
        while (mostLeft != null && mostLeft.left != null){
            mostLeft = mostLeft.left;
        }
        return mostLeft;
    }

    //寻找值为value的节点
    public TreeNode findNode(int value){
        TreeNode cur = root;
        while (cur != null){
            if (cur.value > value){
                cur = cur.left;
            }else if (cur.value == value){
                return cur;
            }else {
                cur = cur.right;
            }
        }
        return null;
    }

    //从二叉搜索树中删除值为value的节点
    public void delete(int value){
        //在二叉搜索树中寻找值为value的节点
        TreeNode node = findNode(value);
        if (node == null){
            System.out.println("二叉搜索树不存在值为" + value + "的节点，删除失败。");
            return;
        }
        //node为要删除的值
        //节点node的左右节点都存在，将node节点的后继节点s
        // 即大于node节点值的最小节点，即node节点的右子树中最左边的一个节点，将s中的值拷贝到node中，然后删除s
        // 此时s最多只有右子树
        if (node.left != null && node.right != null){
            TreeNode s = successor(node);
            node.value = s.value;
            node = s;
        }

        // replacement表示替代被删除节点的节点，node节点被删除了，只能用其子节点代替
        // 经过上面的转换，node要么没有子节点，要么只有一个子节点
        TreeNode replacement = node.left == null ? node.right : node.left;
        if (replacement == null){
            //无替换节点，也就是node没有左节点和右节点，直接删除即可
            //BST树只有根节点，删除后，BST树为空树
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
                node.parent = null;
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
        }
    }

    //中序遍历
    public void inOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        inOrder(cur.left);
        System.out.println(cur.value);
        inOrder(cur.right);
    }
}

public class BSTTest {
    public static void main(String[] args) {
        BinarySearchTree bst = new BinarySearchTree();
        int [] arr = {9, 6, 13, 2, 7, 12, 15, 1, 3};
        for (int value: arr){
            bst.insert(value);
        }
        //bst.inOrder(bst.root);
        //输出结果为 1, 2, 3, 6, 7, 9, 12, 13, 15
        bst.delete(13);
        bst.inOrder(bst.root);
        //输出结果为 1, 2, 3, 6, 7, 9, 12, 15
        bst.delete(9);
        bst.inOrder(bst.root);
        //输出结果为 1, 2, 3, 6, 7, 12, 15
    }
}
`
const text = `<pre>${coding}</pre>`

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