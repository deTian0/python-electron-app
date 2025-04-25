from calculator.simple import SimpleCalculator
from flask import Flask, jsonify, request

from flask_cors import CORS
import subprocess

import os
import sys
import time
import threading


def calcOp(text):
  """based on the input text, return the operation result"""
  try:
    c = SimpleCalculator()
    c.run(text)
    return c.log[-1]
  except Exception as e:
    print(e)
    return 0.0


sys.path.append(
  os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # not required after 'pip install uiautomation'
import uiautomation as auto


def threadFunc(nickname, message, exepath):
  """
  If you want to use UI Controls in a new thread, create an UIAutomationInitializerInThread object first.
  But you can't use use a Control or a Pattern created in a different thread.
  So you can't create a Control or a Pattern in main thread and then pass it to a new thread and use it.
  """
  # print(uselessRoot)# you cannot use uselessRoot because it is a control created in a different thread
  th = threading.currentThread()
  auto.Logger.WriteLine('\nThis is running in a new thread. {} {}'.format(th.ident, th.name), auto.ConsoleColor.Cyan)
  time.sleep(2)
  with auto.UIAutomationInitializerInThread(debug=True):
    ui = uiautoCalc(exepath=exepath)
    ui.wx_demo(nickname, message)
  auto.Logger.WriteLine('\nThread exits. {} {}'.format(th.ident, th.name), auto.ConsoleColor.Cyan)


app = Flask(__name__, )
CORS(app)  # 允许所有跨域请求


class uiautoCalc():
  """uiautomation控制计算器
  """

  def __init__(self, exepath):
    super().__init__()

    # self.logger = Loggers().myLogger()
    auto.uiautomation.DEBUG_SEARCH_TIME = False
    auto.uiautomation.SetGlobalSearchTimeout(2)  # 设置全局搜索超时时间
    print('请在登录微信的情况下使用')
    self.wxWindow = auto.WindowControl(searchDepth=1, Name='微信', desc='微信窗口')  # 微信窗口
    if not self.wxWindow.Exists(0, 0):

      # user_path = input("微信路径：")
      # subprocess.Popen(r'D:\soft\WeChat\WeChat.exe')
      # 检查路径是否存在
      if not os.path.exists(exepath):
        print("指定的路径不存在，请检查路径是否正确。")
      else:
        # 启动微信
        subprocess.Popen(exepath)
        self.wxWindow = auto.WindowControl(searchDepth=1, Name='微信', desc='微信窗口')  # 微信窗口

      # subprocess.Popen(r'D:\soft\WeChat\WeChat.exe')
      # subprocess.Popen(r'C:\Program Files (x86)\Tencent\WeChat\WeChat.exe')
      # subprocess.Popen('微信')  # 设置窗口前置

    self.wxWindow.SetActive()  # 激活窗口
    self.wxWindow.SetTopmost(True)  # 设置为顶层

  def print_tree(self, data, level=0, prefix="", file=None):
    """
    递归打印嵌套字典为树状结构，并将结果写入文件
    :param data: 嵌套字典
    :param level: 当前层级
    :param prefix: 当前行的前缀
    :param file: 文件对象
    """
    for key, value in data.items():
      if isinstance(value, dict):
        # 如果是字典，递归打印
        if key == "child":
          # 如果是子节点，增加层级
          self.print_tree(value, level + 1, prefix + "    ", file)
        else:
          # 打印当前节点信息
          name = value.get("name", "")
          node_info = str(value.get("node", ""))
          # 写入文件
          file.write(f"{prefix}{'├── ' if level > 0 else ''}{name} ({node_info})\n")
          # 递归打印子节点
          if "child" in value:
            self.print_tree(value["child"], level + 1, prefix + "    ", file)
      else:
        # 如果不是字典，直接写入文件
        file.write(f"{prefix}{'├── ' if level > 0 else ''}{key}: {value}\n")

  def get_chiren_tree(self, node, max_depth=None, current_depth=0):
    """
    递归获取节点的树形结构，支持控制递归深度
    :param node: 当前节点
    :param max_depth: 最大递归深度，None 表示无限制
    :param current_depth: 当前递归深度
    :return: 树形结构的字典
    """
    res = {}
    for index, child in enumerate(node.GetChildren()):
      res[index] = {
        'name': child.Name,
        'id': index,
        'node': child
      }
      # 如果指定了最大深度，并且当前深度已达到最大深度，则不再递归
      if max_depth is not None and current_depth >= max_depth:
        continue
      try:
        if len(child.GetChildren()) > 0:
          res[index]['child'] = self.get_chiren_tree(child, max_depth, current_depth + 1)
      except Exception as e:
        print(e)
    return res

  def wx_demo(self, nickname, message):
    """计算器示例
    :return :
    """

    self.target_username = nickname
    self.msg_context = message
    # 获取搜索窗口
    self.sousuoEditControl = self.wxWindow.EditControl(searchDepth=7, Name='搜索')
    self.sousuoEditControl.Click()

    # 获取清空输入框
    self.qingkongButtonControl = self.wxWindow.ButtonControl(searchDepth=7, Name='清空')
    self.qingkongButtonControl.Click()

    self.sousuoEditControl.Click()
    self.sousuoEditControl.SendKeys(self.target_username)

    # 获取搜索结果
    self.searchResultListItemControl = self.wxWindow.ListItemControl(searchDepth=7, Name=self.target_username)

    self.searchResultListItemControl.Click()

    # 获取输入窗口
    self.msgTextControl = self.wxWindow.TextControl(Name=self.target_username)
    self.msgTextControl.Click()
    self.msgTextControl.SendKeys(self.msg_context)
    self.msgTextControl.SendKeys('{Enter}')

    # 重新获取控件树
    tree = self.get_chiren_tree(self.wxWindow, )
    # 打开文件，如果文件已存在则覆盖，否则创建
    with open("element_node_tree_1.txt", "w", encoding="utf-8") as file:
      self.print_tree(tree, file=file)


@app.route('/sendMsg', methods=['POST'])
def send_msg():
  # 获取 JSON 数据
  data = request.json
  if not data:
    return jsonify({"error": "Invalid request data"}), 400

  # 提取昵称和消息内容
  nickname = data.get('nickname')
  message = data.get('message')
  exepath = data.get('exepath')

  # 验证数据是否完整
  if not nickname or not message:
    return jsonify({"error": "Nickname and message are required"}), 400

  # 打印接收到的数据（可以根据需要保存到数据库或其他处理逻辑）
  print(f"收到消息：昵称 = {nickname}, 消息内容 = {message}, exepath = {exepath}")
  th = threading.Thread(target=threadFunc, args=(nickname, message, exepath))
  th.start()
  th.join()

  # 返回成功响应
  return jsonify({"status": "success", "message": "消息已接收"})


@app.route('/')
def hello_world():  # put application's code here
  return 'Hello World!'


@app.route("/<input>")
# @cross_origin()
def calc(input):
  return calcOp(input)


if __name__ == '__main__':
  app.run(host='127.0.0.1', port=5001, use_reloader=False)
