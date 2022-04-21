const lt = "<text decode='true'>&lt;</text>"
const text = `
<pre>package algorithm.java_coding;

import java.util.ArrayDeque;
import java.util.Deque;

class TreeNode{
    public int value;
    public TreeNode left;
    public TreeNode right;

    public TreeNode(int value){
        this.value = value;
    }
}
public class TraverseBinaryTree {
    //递归方式
    //前序
    public void recursivePreOrder(TreeNode cur) {
        if (cur == null) {
            return;
        }
        //输出当前节点值
        System.out.println(cur.value);
        //递归遍历左子树
        recursivePreOrder(cur.left);
        //递归遍历右子树
        recursivePreOrder(cur.right);
    }

    //中序
    public void recursiveInOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        //递归遍历左子树
        recursiveInOrder(cur.left);
        //输出当前节点值
        System.out.println(cur.value);
        //递归遍历右子树
        recursiveInOrder(cur.right);
    }

    //后序
    public void recursivePostOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        //递归遍历左子树
        recursivePostOrder(cur.left);
        //递归遍历右子树
        recursivePostOrder(cur.right);
        //输出当前节点值
        System.out.println(cur.value);
    }

    //非递归方式
    //前序
    /*
    算法执行过程：
    1、申请一个栈stack，然后将头节点压入stack中。
    2、从stack中弹出栈顶节点，打印，再将其右孩子节点（不为空的话）先压入stack中，最后将其左孩子节点（不为空的话）压入stack中。
    3、不断重复步骤2，直到stack为空，全部过程结束。
     */
    public void nonrecursivePreOrder(TreeNode root){
        if (root == null){
            return;
        }
        Deque${lt}TreeNode> stack = new ArrayDeque${lt}>();
        //根节点进栈
        stack.push(root);
        while (!stack.isEmpty()){
            //出栈
            TreeNode cur = stack.poll();
            System.out.println(cur.value);
            //根据栈先进先出的特点以及二叉树前序遍历的特点
            //先让右节点进栈，左节点后进栈
            if (cur.right != null){
                //进栈
                stack.push(cur.right);
            }
            if (cur.left != null){
                //进栈
                stack.push(cur.left);
            }
        }
    }

    //中序遍历
    /*
    算法执行过程：
    1、申请一个栈stack。
    2、先把cur压入栈中，依次把左边界压入栈中，即不停的令cur=cur.left，重复步骤2。
    3、不断重复2，直到为null，从stack中弹出一个节点，记为node，打印node的值，并令cur=node.right,重复步骤2。
    4、当stack为空且cur为空时，整个过程停止。
     */
    public void nonrecursiveInOrder(TreeNode cur){
        Deque${lt}TreeNode> stack = new ArrayDeque${lt}>();
        while (!stack.isEmpty() || cur != null){
            if (cur != null){
                stack.push(cur);
                cur = cur.left;
            }else {
                cur = stack.poll();
                System.out.println(cur.value);
                cur = cur.right;
            }
        }
    }

    //后序遍历
    /*
    算法执行过程：
    1、申请一个栈s1，然后将头节点压入栈s1中。
    2、从s1中弹出的节点记为cur，然后依次将cur的左孩子节点和右孩子节点压入s1中。
    3、在整个过程中，每一个从s1中弹出的节点都放进s2中。
    4、不断重复步骤2和步骤3，直到s1为空，过程停止。
    5、从s2中依次弹出节点并打印，打印的顺序就是后序遍历的顺序。
     */
    public void nonrecursivePostOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        Deque${lt}TreeNode> s1 = new ArrayDeque${lt}>();
        Deque${lt}TreeNode> s2 = new ArrayDeque${lt}>();
        s1.push(cur);
        while (!s1.isEmpty()){
            cur = s1.poll();
            s2.push(cur);
            if (cur.left != null){
                s1.push(cur.left);
            }
            if (cur.right != null){
                s1.push(cur.right);
            }
        }
        while (!s2.isEmpty()){
            cur = s2.poll();
            System.out.println(cur.value);
        }
    }

    //层序遍历
    /*
    算法执行过程：
    1.大体思想是需要创建个队列放入节点 使用遍历思想。
    2.先判断根节点是否为空,如果不为空,入队,先把根放进来。
    3.队列不为空  弹出队头元素  并打印它。
    4.因为先打印左节点，后打印右节点，所以根据队列‘先进先出’的特点，
    先左节点入队，后右节点入队
     */
    public void levelOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        //申请一个队列
        Deque${lt}TreeNode> queue = new ArrayDeque${lt}>();
        //根节点入队
        queue.push(cur);
        while (!queue.isEmpty()){
            //出队
            cur = queue.pollLast();
            System.out.println(cur.value);
            if (cur.left != null){
                //左节点入队
                queue.push(cur.left);
            }
            if (cur.right != null){
                //右节点入队
                queue.push(cur.right);
            }
        }
    }

    public static void main(String[] args) {
    }
}
</pre>
`

const coding = `package algorithm.java_coding;

import java.util.ArrayDeque;
import java.util.Deque;

class TreeNode{
    public int value;
    public TreeNode left;
    public TreeNode right;

    public TreeNode(int value){
        this.value = value;
    }
}
public class TraverseBinaryTree {
    //递归方式
    //前序
    public void recursivePreOrder(TreeNode cur) {
        if (cur == null) {
            return;
        }
        //输出当前节点值
        System.out.println(cur.value);
        //递归遍历左子树
        recursivePreOrder(cur.left);
        //递归遍历右子树
        recursivePreOrder(cur.right);
    }

    //中序
    public void recursiveInOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        //递归遍历左子树
        recursiveInOrder(cur.left);
        //输出当前节点值
        System.out.println(cur.value);
        //递归遍历右子树
        recursiveInOrder(cur.right);
    }

    //后序
    public void recursivePostOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        //递归遍历左子树
        recursivePostOrder(cur.left);
        //递归遍历右子树
        recursivePostOrder(cur.right);
        //输出当前节点值
        System.out.println(cur.value);
    }

    //非递归方式
    //前序
    /*
    算法执行过程：
    1、申请一个栈stack，然后将头节点压入stack中。
    2、从stack中弹出栈顶节点，打印，再将其右孩子节点（不为空的话）先压入stack中，最后将其左孩子节点（不为空的话）压入stack中。
    3、不断重复步骤2，直到stack为空，全部过程结束。
     */
    public void nonrecursivePreOrder(TreeNode root){
        if (root == null){
            return;
        }
        Deque<TreeNode> stack = new ArrayDeque<>();
        //根节点进栈
        stack.push(root);
        while (!stack.isEmpty()){
            //出栈
            TreeNode cur = stack.poll();
            System.out.println(cur.value);
            //根据栈先进先出的特点以及二叉树前序遍历的特点
            //先让右节点进栈，左节点后进栈
            if (cur.right != null){
                //进栈
                stack.push(cur.right);
            }
            if (cur.left != null){
                //进栈
                stack.push(cur.left);
            }
        }
    }

    //中序遍历
    /*
    算法执行过程：
    1、申请一个栈stack。
    2、先把cur压入栈中，依次把左边界压入栈中，即不停的令cur=cur.left，重复步骤2。
    3、不断重复2，直到为null，从stack中弹出一个节点，记为node，打印node的值，并令cur=node.right,重复步骤2。
    4、当stack为空且cur为空时，整个过程停止。
     */
    public void nonrecursiveInOrder(TreeNode cur){
        Deque<TreeNode> stack = new ArrayDeque<>();
        while (!stack.isEmpty() || cur != null){
            if (cur != null){
                stack.push(cur);
                cur = cur.left;
            }else {
                cur = stack.poll();
                System.out.println(cur.value);
                cur = cur.right;
            }
        }
    }

    //后序遍历
    /*
    算法执行过程：
    1、申请一个栈s1，然后将头节点压入栈s1中。
    2、从s1中弹出的节点记为cur，然后依次将cur的左孩子节点和右孩子节点压入s1中。
    3、在整个过程中，每一个从s1中弹出的节点都放进s2中。
    4、不断重复步骤2和步骤3，直到s1为空，过程停止。
    5、从s2中依次弹出节点并打印，打印的顺序就是后序遍历的顺序。
     */
    public void nonrecursivePostOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        Deque<TreeNode> s1 = new ArrayDeque<>();
        Deque<TreeNode> s2 = new ArrayDeque<>();
        s1.push(cur);
        while (!s1.isEmpty()){
            cur = s1.poll();
            s2.push(cur);
            if (cur.left != null){
                s1.push(cur.left);
            }
            if (cur.right != null){
                s1.push(cur.right);
            }
        }
        while (!s2.isEmpty()){
            cur = s2.poll();
            System.out.println(cur.value);
        }
    }

    //层序遍历
    /*
    算法执行过程：
    1.大体思想是需要创建个队列放入节点 使用遍历思想。
    2.先判断根节点是否为空,如果不为空,入队,先把根放进来。
    3.队列不为空  弹出队头元素  并打印它。
    4.因为先打印左节点，后打印右节点，所以根据队列‘先进先出’的特点，
    先左节点入队，后右节点入队
     */
    public void levelOrder(TreeNode cur){
        if (cur == null){
            return;
        }
        //申请一个队列
        Deque<TreeNode> queue = new ArrayDeque<>();
        //根节点入队
        queue.push(cur);
        while (!queue.isEmpty()){
            //出队
            cur = queue.pollLast();
            System.out.println(cur.value);
            if (cur.left != null){
                //左节点入队
                queue.push(cur.left);
            }
            if (cur.right != null){
                //右节点入队
                queue.push(cur.right);
            }
        }
    }

    public static void main(String[] args) {
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