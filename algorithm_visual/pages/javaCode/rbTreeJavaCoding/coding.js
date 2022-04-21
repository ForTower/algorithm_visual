const lt = "<text decode='true'>&lt;</text>"
//反斜杠
const i = "<text decode='true'>\\</text>"
const text = `<pre>package datastruct.java_coding;

class RBTree {
    private static final boolean RED = false;
    private static final boolean BLACK = true;
    private RBNode root;

    private class RBNode {
        private int value;
        private RBNode left;
        private RBNode right;
        private RBNode parent;
        private boolean color; //默认是红色(false)

        public RBNode(int value) {
            this.value = value;
        }
    }

    //插入的大体思路是：先把节点插入到树中，再通过旋转或变色来使红黑树保持平衡状态
    public void insert(int value) {
        //插入节点newNode默认是红色
        RBNode newNode = new RBNode(value);
        if (root == null) {
            //根据红黑树的定义，根节点必须为黑色
            newNode.color = BLACK;
            root = newNode;
            return;
        }

        //寻找插入的位置
        RBNode cur = root;
        RBNode p = cur;
        while (cur != null) {
            p = cur;
            if (cur.value > value) {
                //在左子树寻找
                cur = cur.left;
            } else if (cur.value == value) {
                System.out.println(value + "在红黑树中已经存在，插入失败。");
                return;
            } else {
                //在右子树寻找
                cur = cur.right;
            }
        }
        //将节点插入到相应的位置
        if (p.value > value) {
            p.left = newNode;
        } else {
            p.right = newNode;
        }
        newNode.parent = p;

        //插入后调整平衡
        fixAfterInsert(newNode);
    }

    /*
     * 修复颜色，因为插入的点，我们总是默认染成红色，所以如果父节点为黑色则不需要修复，如果父节点为红色，则需要修复
     * 修复颜色分三种情况：
     * 1.当前插入点的父亲为红色，且祖父节点的另一个节点为也为红色，且父节点为祖父节点的左子节点
     * 2.当前插入点的父节点为红色，且祖父节点的另一个节点为黑色，且本节点为父结点的右子节点
     * 3.当前插入点的父节点为红色，且祖父节点的另一个节点为黑色，且本节点为父结点的左子节点
     */
    private void fixAfterInsert(RBNode x) {
        //如果x(red)的父亲是红色并且x不是根节点，才需要调整
        while (parentOf(x) != null && colorOf(parentOf(x)) == RED) {
            //插入节点x是其父亲节点的左孩子
            if (leftOf(parentOf(x)) == x) {
                //x节点的叔叔节点
                RBNode uncle = rightOf(parentOf(parentOf(x)));
                //          爷爷(black)
                //          /    ${i}
                //    父亲(red)  叔叔(red)
                //     /
                //    x(red)
                if (colorOf(uncle) == RED) {
                    //父亲变黑色
                    setColor(parentOf(x), BLACK);
                    //爷爷变红色
                    setColor(parentOf(parentOf(x)), RED);
                    //叔叔变黑色
                    setColor(uncle, BLACK);
                    x = parentOf(parentOf(x));
                } else {
                    //提示：根据colorOf()方法，uncle有可能为null
                    //有两种策略，1、先旋转，后变色，2、先变色，再旋转
                    //这里采用策略1
                    //左旋之前
                    //          爷爷(black)              爷爷(black)
                    //          /    ${i}                  /     ${i}
                    //    父亲(red)   叔叔(black)  或   父亲(red)  null
                    //     /                            /
                    //    x(red)                      x(red)
                    //以爷爷为支点，进行右旋
                    rightRotate(parentOf(parentOf(x)));
                    //右旋后的结果
                    //      父亲(red)                 父亲(red)
                    //      /      ${i}                  /   ${i}
                    //     x(red)  爷爷(black) 或   x(red)  爷爷(black)
                    //               ${i}      =>              ${i}
                    //               uncle(black)             null
                    //变色
                    //父亲变为黑色
                    setColor(parentOf(x), BLACK);
                    //爷爷变为红色
                    setColor(rightOf(parentOf(x)), RED);
                    //退出循环
                    x = root;
                }

            } else {
                //插入节点x是其父亲节点的有孩子
                //跟以上是相反的过程
                RBNode uncle = leftOf(parentOf(parentOf(x)));
                if (colorOf(uncle) == RED) {
                    setColor(parentOf(x), BLACK);
                    setColor(parentOf(parentOf(x)), RED);
                    setColor(uncle, BLACK);
                    x = parentOf(parentOf(x));
                } else {
                    leftRotate(parentOf(parentOf(x)));
                    setColor(parentOf(x), BLACK);
                    setColor(leftOf(parentOf(x)), RED);
                    x = root;
                }
            }
        }
        //因为在变色调整平衡过程中，有可能把根节点变成红色
        //根据红黑树的性质，根节点必须是黑色的，所以需要把根节点设置为黑色
        setColor(root, BLACK);
    }

    /*
    删除的大体思路：
       1、如果删除的是一个红色节点，直接删除
       2、如果删除的是一个黑色节点，先调整，在删除
       3、删除的节点一定是该红黑树对应的2-3-4树的叶子节点，
       也就是删除的节点一定是红黑树的叶子节点或者是叶子节点的父节点
       4、删除的口诀，自己能搞得定，自己搞定；自己搞不定，找兄弟借，兄弟有却不借，父亲下来帮忙，兄弟当家；
       兄弟没得借，唯有自损。
     */
    public void delete(int value) {
        RBNode node = findNode(value);
        if (node == null) {
            System.out.println("红黑树中不存在" + value + ",删除失败。");
            return;
        }
        //node为要删除的节点
        if (node.left != null && node.right != null) {
            //node节点的后继节点
            RBNode s = successor(node);
            node.value = s.value;
            node = s;
        }
        //node为要删除的节点，replacement为代替node节点的节点
        RBNode replacement = node.left == null ? node.right : node.left;
        //删除的node节点是叶子节点
        if (replacement == null) {
            //删除的是根节点，直接删除
            if (node.parent == null) {
                root = null;
            } else {
                //删除的node节点是黑色的，先调整
                if (colorOf(node) == BLACK) {
                    fixBeforeDelete(node);
                }
                //再删除
                if (leftOf(parentOf(node)) == node) {
                    node.parent.left = null;
                } else {
                    node.parent.right = null;
                }
                node.parent = null;
            }
        } else {
            //node存在替代节点replacement，node节点一定是黑色节点，replacement节点一定是红色节点
            replacement.color = BLACK;
            replacement.parent = node.parent;
            //删除的是根节点
            if (node.parent == null) {
                root = replacement;
            } else if (node.parent.left == node) {
                //删除的是父节点的左孩子
                node.parent.left = replacement;
            } else {
                //删除的是父节点的有孩子
                node.parent.right = replacement;
            }
            //删除node节点对其他节点的引用关系，使其变成垃圾被回收掉
            node.parent = node.left = node.right = null;
        }
    }

    //删除之前调整，有两种策略，1、先旋转，再变色，2、先变色，再旋转
    //这里采用策略1
    private void fixBeforeDelete(RBNode x) {
        //x一定不是根节点且x节点一定是黑色的叶子节点
        while (parentOf(x) != null && colorOf(x) == BLACK) {
            //删除的x节点是父节点的左孩子
            if (leftOf(parentOf(x)) == x) {
                //x节点的兄弟节点
                RBNode brother = rightOf(parentOf(x));
                //brother节点不是x节点真正的兄弟节点，通过旋转使其成为真正的兄弟节点
                //左旋之前
                //          父亲(black)
                //          /        ${i}
                //      x(black)     brother(red)
                //                     /      ${i}
                //              侄子1(black)  侄子2(black)
                if (colorOf(brother) == RED) {
                    //以x节点的父亲节点为支点，进行左旋转
                    leftRotate(parentOf(x));
                    //左旋之后
                    //         brother(red)
                    //         /      ${i}
                    //   父亲(black)   侄子2(black)
                    //    /     ${i}
                    // x(black)  侄子1(black)
                    //brother变成黑色
                    setColor(brother, BLACK);
                    //父亲变成红色
                    setColor(parentOf(x), RED);
                    //使brother成为x真正的兄弟节点
                    brother = rightOf(parentOf(x));
                }
                //兄弟没得借，唯有自损
                if (colorOf(leftOf(brother)) == BLACK && colorOf(rightOf(brother)) == BLACK) {
                    //兄弟自损颜色变成红色
                    setColor(brother, RED);
                    x = parentOf(x);
                } else {
                    if (colorOf(rightOf(brother)) == BLACK) {
                        //右旋转之前
                        //          父亲(red or black)
                        //             /        ${i}
                        //         x(black)      brother(black)
                        //                        /
                        //                       侄子(red)
                        //以brother节点为支点，右旋转
                        rightRotate(brother);
                        //右旋转之后
                        //             父亲(red or black)
                        //              /          ${i}
                        //            x(black)      侄子(red)
                        //                             ${i}
                        //                             brother(black)
                        //侄子变黑色
                        setColor(parentOf(brother), BLACK);
                        //brother变红色
                        setColor(brother, RED);
                        brother = parentOf(brother);
                    }
                    //左旋之前
                    //               父亲(red or black)                      父亲(red or black)
                    //                /            ${i}                           /          ${i}
                    //              x(black)       brother(black)      或   x(black)      brother(black)
                    //                               /      ${i}      =>                        ${i}
                    //                         侄子1(red)   侄子2(red)                        侄子(red)
                    //以父亲节点为支点，左旋转
                    leftRotate(parentOf(x));
                    //左旋之后
                    //           brother(black)                 brother(black)
                    //           /          ${i}                        /       ${i}
                    // 父亲(red or black)    侄子2(red) 或  父亲(red or black)  侄子(red)
                    //        /    ${i}                               /
                    // x(black)    侄子1(red)                   x(black)
                    //变色
                    //brother的颜色变成父亲的颜色
                    setColor(brother, colorOf(parentOf(x)));
                    //父亲变成黑色
                    setColor(parentOf(x), BLACK);
                    //侄子变成黑色
                    setColor(rightOf(brother), BLACK);
                    //退出循环
                    x = root;
                }
            } else {
                //删除的节点是父节点的右孩子，和以上过程是一个相反的过程
                RBNode brother = leftOf(parentOf(x));
                if (colorOf(brother) == RED) {
                    rightRotate(parentOf(x));
                    setColor(brother, BLACK);
                    setColor(parentOf(x), RED);
                    brother = leftOf(parentOf(x));
                }

                if (colorOf(leftOf(brother)) == BLACK && colorOf(rightOf(brother)) == BLACK) {
                    setColor(brother, RED);
                    x = parentOf(x);
                } else {
                    if (colorOf(leftOf(brother)) == BLACK) {
                        leftRotate(brother);
                        setColor(brother, RED);
                        setColor(parentOf(brother), BLACK);
                        brother = parentOf(brother);
                    }
                    rightRotate(parentOf(x));
                    setColor(brother, colorOf(parentOf(x)));
                    setColor(parentOf(x), BLACK);
                    setColor(leftOf(brother), BLACK);
                    x = root;
                }
            }
        }
        setColor(x, BLACK);
    }

    //返回node节点的后继节点
    private RBNode successor(RBNode node) {
        RBNode mostLeft = node.right;
        while (mostLeft != null && mostLeft.left != null) {
            mostLeft = mostLeft.left;
        }
        return mostLeft;
    }

    //返回值为value的节点
    private RBNode findNode(int value) {
        RBNode cur = root;
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
    private void leftRotate(RBNode pivot) {
        RBNode right = pivot.right;
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
    }

    //以pivot为支点进行右旋转
    //        pivot               left
    //        /   ${i}               /   ${i}
    //     left         右旋           pivot
    //    /   ${i}                        /   ${i}
    private void rightRotate(RBNode pivot) {
        RBNode left = pivot.left;
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
    }

    //返回parent节点的左孩子节点
    private RBNode leftOf(RBNode parent) {
        return parent == null ? null : parent.left;
    }

    //返回parent节点的右孩子节点
    private RBNode rightOf(RBNode parent) {
        return parent == null ? null : parent.right;
    }

    //返回child节点的父亲节点
    private RBNode parentOf(RBNode child) {
        return child == null ? null : child.parent;
    }

    //设置颜色
    private void setColor(RBNode node, boolean color) {
        if (node == null) return;
        node.color = color;
    }

    //获取node节点的颜色
    //如果node==null,就返回黑色，否则返回node.color
    private boolean colorOf(RBNode node) {
        return node == null ? BLACK : node.color;
    }

    public RBNode getRoot() {
        return root;
    }

    public void preOrder(RBNode cur) {
        if (cur == null) {
            return;
        }
        System.out.println(cur.value + " " + (cur.color == RED ? "red" : "black"));
        preOrder(cur.left);
        preOrder(cur.right);
    }
}

public class RBTreeCoding {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        RBTree rbTree = new RBTree();
        for (int i = 0; i ${lt} arr.length; i++) {
            rbTree.insert(arr[i]);
        }
//        rbTree.preOrder(rbTree.getRoot());
        rbTree.delete(4);
        rbTree.delete(5);
        rbTree.delete(6);
        rbTree.delete(7);
        rbTree.delete(8);
        rbTree.preOrder(rbTree.getRoot());
    }
}
</pre>
`
const coding = `package datastruct.java_coding;

class RBTree {
    private static final boolean RED = false;
    private static final boolean BLACK = true;
    private RBNode root;

    private class RBNode {
        private int value;
        private RBNode left;
        private RBNode right;
        private RBNode parent;
        private boolean color; //默认是红色(false)

        public RBNode(int value) {
            this.value = value;
        }
    }

    //插入的大体思路是：先把节点插入到树中，再通过旋转或变色来使红黑树保持平衡状态
    public void insert(int value) {
        //插入节点newNode默认是红色
        RBNode newNode = new RBNode(value);
        if (root == null) {
            //根据红黑树的定义，根节点必须为黑色
            newNode.color = BLACK;
            root = newNode;
            return;
        }

        //寻找插入的位置
        RBNode cur = root;
        RBNode p = cur;
        while (cur != null) {
            p = cur;
            if (cur.value > value) {
                //在左子树寻找
                cur = cur.left;
            } else if (cur.value == value) {
                System.out.println(value + "在红黑树中已经存在，插入失败。");
                return;
            } else {
                //在右子树寻找
                cur = cur.right;
            }
        }
        //将节点插入到相应的位置
        if (p.value > value) {
            p.left = newNode;
        } else {
            p.right = newNode;
        }
        newNode.parent = p;

        //插入后调整平衡
        fixAfterInsert(newNode);
    }

    /*
     * 修复颜色，因为插入的点，我们总是默认染成红色，所以如果父节点为黑色则不需要修复，如果父节点为红色，则需要修复
     * 修复颜色分三种情况：
     * 1.当前插入点的父亲为红色，且祖父节点的另一个节点为也为红色，且父节点为祖父节点的左子节点
     * 2.当前插入点的父节点为红色，且祖父节点的另一个节点为黑色，且本节点为父结点的右子节点
     * 3.当前插入点的父节点为红色，且祖父节点的另一个节点为黑色，且本节点为父结点的左子节点
     */
    private void fixAfterInsert(RBNode x) {
        //如果x(red)的父亲是红色并且x不是根节点，才需要调整
        while (parentOf(x) != null && colorOf(parentOf(x)) == RED) {
            //插入节点x是其父亲节点的左孩子
            if (leftOf(parentOf(x)) == x) {
                //x节点的叔叔节点
                RBNode uncle = rightOf(parentOf(parentOf(x)));
                //          爷爷(black)
                //          /    \\
                //    父亲(red)  叔叔(red)
                //     /
                //    x(red)
                if (colorOf(uncle) == RED) {
                    //父亲变黑色
                    setColor(parentOf(x), BLACK);
                    //爷爷变红色
                    setColor(parentOf(parentOf(x)), RED);
                    //叔叔变黑色
                    setColor(uncle, BLACK);
                    x = parentOf(parentOf(x));
                } else {
                    //提示：根据colorOf()方法，uncle有可能为null
                    //有两种策略，1、先旋转，后变色，2、先变色，再旋转
                    //这里采用策略1
                    //左旋之前
                    //          爷爷(black)              爷爷(black)
                    //          /    \\                    /     \\
                    //    父亲(red)   叔叔(black)  或   父亲(red)  null
                    //     /                            /
                    //    x(red)                      x(red)
                    //以爷爷为支点，进行右旋
                    rightRotate(parentOf(parentOf(x)));
                    //右旋后的结果
                    //      父亲(red)                 父亲(red)
                    //      /      \\                 /   \\
                    //     x(red)  爷爷(black) 或   x(red)  爷爷(black)
                    //               \\                       \\
                    //               uncle(black)             null
                    //变色
                    //父亲变为黑色
                    setColor(parentOf(x), BLACK);
                    //爷爷变为红色
                    setColor(rightOf(parentOf(x)), RED);
                    //退出循环
                    x = root;
                }

            } else {
                //插入节点x是其父亲节点的有孩子
                //跟以上是相反的过程
                RBNode uncle = leftOf(parentOf(parentOf(x)));
                if (colorOf(uncle) == RED) {
                    setColor(parentOf(x), BLACK);
                    setColor(parentOf(parentOf(x)), RED);
                    setColor(uncle, BLACK);
                    x = parentOf(parentOf(x));
                } else {
                    leftRotate(parentOf(parentOf(x)));
                    setColor(parentOf(x), BLACK);
                    setColor(leftOf(parentOf(x)), RED);
                    x = root;
                }
            }
        }
        //因为在变色调整平衡过程中，有可能把根节点变成红色
        //根据红黑树的性质，根节点必须是黑色的，所以需要把根节点设置为黑色
        setColor(root, BLACK);
    }

    /*
    删除的大体思路：
       1、如果删除的是一个红色节点，直接删除
       2、如果删除的是一个黑色节点，先调整，在删除
       3、删除的节点一定是该红黑树对应的2-3-4树的叶子节点，
       也就是删除的节点一定是红黑树的叶子节点或者是叶子节点的父节点
       4、删除的口诀，自己能搞得定，自己搞定；自己搞不定，找兄弟借，兄弟有却不借，父亲下来帮忙，兄弟当家；
       兄弟没得借，唯有自损。
     */
    public void delete(int value) {
        RBNode node = findNode(value);
        if (node == null) {
            System.out.println("红黑树中不存在" + value + ",删除失败。");
            return;
        }
        //node为要删除的节点
        if (node.left != null && node.right != null) {
            //node节点的后继节点
            RBNode s = successor(node);
            node.value = s.value;
            node = s;
        }
        //node为要删除的节点，replacement为代替node节点的节点
        RBNode replacement = node.left == null ? node.right : node.left;
        //删除的node节点是叶子节点
        if (replacement == null) {
            //删除的是根节点，直接删除
            if (node.parent == null) {
                root = null;
            } else {
                //删除的node节点是黑色的，先调整
                if (colorOf(node) == BLACK) {
                    fixBeforeDelete(node);
                }
                //再删除
                if (leftOf(parentOf(node)) == node) {
                    node.parent.left = null;
                } else {
                    node.parent.right = null;
                }
                node.parent = null;
            }
        } else {
            //node存在替代节点replacement，node节点一定是黑色节点，replacement节点一定是红色节点
            replacement.color = BLACK;
            replacement.parent = node.parent;
            //删除的是根节点
            if (node.parent == null) {
                root = replacement;
            } else if (node.parent.left == node) {
                //删除的是父节点的左孩子
                node.parent.left = replacement;
            } else {
                //删除的是父节点的有孩子
                node.parent.right = replacement;
            }
            //删除node节点对其他节点的引用关系，使其变成垃圾被回收掉
            node.parent = node.left = node.right = null;
        }
    }

    //删除之前调整，有两种策略，1、先旋转，再变色，2、先变色，再旋转
    //这里采用策略1
    private void fixBeforeDelete(RBNode x) {
        //x一定不是根节点且x节点一定是黑色的叶子节点
        while (parentOf(x) != null && colorOf(x) == BLACK) {
            //删除的x节点是父节点的左孩子
            if (leftOf(parentOf(x)) == x) {
                //x节点的兄弟节点
                RBNode brother = rightOf(parentOf(x));
                //brother节点不是x节点真正的兄弟节点，通过旋转使其成为真正的兄弟节点
                //左旋之前
                //          父亲(black)
                //          /        \\
                //      x(black)     brother(red)
                //                     /      \\
                //              侄子1(black)  侄子2(black)
                if (colorOf(brother) == RED) {
                    //以x节点的父亲节点为支点，进行左旋转
                    leftRotate(parentOf(x));
                    //左旋之后
                    //         brother(red)
                    //         /      \\
                    //   父亲(black)   侄子2(black)
                    //    /     \\
                    // x(black)  侄子1(black)
                    //brother变成黑色
                    setColor(brother, BLACK);
                    //父亲变成红色
                    setColor(parentOf(x), RED);
                    //使brother成为x真正的兄弟节点
                    brother = rightOf(parentOf(x));
                }
                //兄弟没得借，唯有自损
                if (colorOf(leftOf(brother)) == BLACK && colorOf(rightOf(brother)) == BLACK) {
                    //兄弟自损颜色变成红色
                    setColor(brother, RED);
                    x = parentOf(x);
                } else {
                    if (colorOf(rightOf(brother)) == BLACK) {
                        //右旋转之前
                        //          父亲(red or black)
                        //             /        \\
                        //         x(black)      brother(black)
                        //                        /
                        //                       侄子(red)
                        //以brother节点为支点，右旋转
                        rightRotate(brother);
                        //右旋转之后
                        //             父亲(red or black)
                        //              /          \\
                        //            x(black)      侄子(red)
                        //                             \\
                        //                             brother(black)
                        //侄子变黑色
                        setColor(parentOf(brother), BLACK);
                        //brother变红色
                        setColor(brother, RED);
                        brother = parentOf(brother);
                    }
                    //左旋之前
                    //               父亲(red or black)                      父亲(red or black)
                    //                /            \\                           /          \\
                    //              x(black)       brother(black)      或   x(black)      brother(black)
                    //                               /      \\                             \\
                    //                         侄子1(red)   侄子2(red)                      侄子(red)
                    //以父亲节点为支点，左旋转
                    leftRotate(parentOf(x));
                    //左旋之后
                    //           brother(black)                 brother(black)
                    //           /          \\                        /       \\
                    // 父亲(red or black)    侄子2(red) 或  父亲(red or black)  侄子(red)
                    //        /    \\                               /
                    // x(black)    侄子1(red)                   x(black)
                    //变色
                    //brother的颜色变成父亲的颜色
                    setColor(brother, colorOf(parentOf(x)));
                    //父亲变成黑色
                    setColor(parentOf(x), BLACK);
                    //侄子变成黑色
                    setColor(rightOf(brother), BLACK);
                    //退出循环
                    x = root;
                }
            } else {
                //删除的节点是父节点的右孩子，和以上过程是一个相反的过程
                RBNode brother = leftOf(parentOf(x));
                if (colorOf(brother) == RED) {
                    rightRotate(parentOf(x));
                    setColor(brother, BLACK);
                    setColor(parentOf(x), RED);
                    brother = leftOf(parentOf(x));
                }

                if (colorOf(leftOf(brother)) == BLACK && colorOf(rightOf(brother)) == BLACK) {
                    setColor(brother, RED);
                    x = parentOf(x);
                } else {
                    if (colorOf(leftOf(brother)) == BLACK) {
                        leftRotate(brother);
                        setColor(brother, RED);
                        setColor(parentOf(brother), BLACK);
                        brother = parentOf(brother);
                    }
                    rightRotate(parentOf(x));
                    setColor(brother, colorOf(parentOf(x)));
                    setColor(parentOf(x), BLACK);
                    setColor(leftOf(brother), BLACK);
                    x = root;
                }
            }
        }
        setColor(x, BLACK);
    }

    //返回node节点的后继节点
    private RBNode successor(RBNode node) {
        RBNode mostLeft = node.right;
        while (mostLeft != null && mostLeft.left != null) {
            mostLeft = mostLeft.left;
        }
        return mostLeft;
    }

    //返回值为value的节点
    private RBNode findNode(int value) {
        RBNode cur = root;
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
    private void leftRotate(RBNode pivot) {
        RBNode right = pivot.right;
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
    }

    //以pivot为支点进行右旋转
    //        pivot               left
    //        /   \\               /   \\
    //     left         右旋           pivot
    //    /   \\                        /   \\
    private void rightRotate(RBNode pivot) {
        RBNode left = pivot.left;
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
    }

    //返回parent节点的左孩子节点
    private RBNode leftOf(RBNode parent) {
        return parent == null ? null : parent.left;
    }

    //返回parent节点的右孩子节点
    private RBNode rightOf(RBNode parent) {
        return parent == null ? null : parent.right;
    }

    //返回child节点的父亲节点
    private RBNode parentOf(RBNode child) {
        return child == null ? null : child.parent;
    }

    //设置颜色
    private void setColor(RBNode node, boolean color) {
        if (node == null) return;
        node.color = color;
    }

    //获取node节点的颜色
    //如果node==null,就返回黑色，否则返回node.color
    private boolean colorOf(RBNode node) {
        return node == null ? BLACK : node.color;
    }

    public RBNode getRoot() {
        return root;
    }

    public void preOrder(RBNode cur) {
        if (cur == null) {
            return;
        }
        System.out.println(cur.value + " " + (cur.color == RED ? "red" : "black"));
        preOrder(cur.left);
        preOrder(cur.right);
    }
}

public class RBTreeCoding {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        RBTree rbTree = new RBTree();
        for (int i = 0; i < arr.length; i++) {
            rbTree.insert(arr[i]);
        }
//        rbTree.preOrder(rbTree.getRoot());
        rbTree.delete(4);
        rbTree.delete(5);
        rbTree.delete(6);
        rbTree.delete(7);
        rbTree.delete(8);
        rbTree.preOrder(rbTree.getRoot());
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