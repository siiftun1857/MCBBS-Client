const events = window.require('events');
const path = window.require('path');
const fs = window.require('fs');

const electron = window.require('electron');
const { ipcRenderer, shell } = electron;
const remote = electron.remote;

import React, { useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import shortid from "shortid";

import { withStyles } from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";
import Grow from '@material-ui/core/Grow';

import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Paper from "@material-ui/core/Paper";
import CssBaseline from "@material-ui/core/CssBaseline";
import Tooltip from "@material-ui/core/Tooltip";
import LinearProgress from '@material-ui/core/LinearProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import MenuIcon from "mdi-material-ui/Menu";
import CloseIcon from "mdi-material-ui/Close";
import DocumentIcon from "mdi-material-ui/FileDocument";
import AccountCircleIcon from "mdi-material-ui/AccountCircle";
import WidgetsIcon from "mdi-material-ui/Widgets";
import ListIcon from "mdi-material-ui/FormatListBulleted";
import HomeIcon from "mdi-material-ui/Home";
import ChevronLeftIcon from "mdi-material-ui/ChevronLeft";
import SendIcon from "mdi-material-ui/Send";
import NoticeIcon from "mdi-material-ui/Bell";
import SettingIcon from "mdi-material-ui/Settings";
import FaceIcon from "mdi-material-ui/Face";
import SignInIcon from "mdi-material-ui/CalendarClock";
import StarIcon from "mdi-material-ui/Star";
import PaintIcon from "mdi-material-ui/Palette";
import StoreIcon from "mdi-material-ui/Store";
import InfoIcon from "mdi-material-ui/Information";
import AddIcon from "mdi-material-ui/Plus";
import TaskIcon from "mdi-material-ui/CalendarText";
import WebIcon from "mdi-material-ui/Web";

import CustomScroll from "react-custom-scroll";

import MainPageRender from "../../scripts/viewManager/pages/mainPage";
import WatchThreadRender from "../../scripts/viewManager/pages/watchThread";
import ForumRender from "../../scripts/viewManager/pages/forum";
import WebView from "../localWebView/webview";

import TestData from "../../scripts/viewManager/testData";
import pageBindScript from "../../scripts/forumWorker/pageBindScript";

const drawerWidth = 200;

const styles = theme => ({
  root: {
    display: "flex",
    overflow: "hidden"
  },
  content: {
    overflowX: "hidden",
    overflowY: "auto",
    maxHeight: "600px",
    width: "752px"
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    width: 48
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  toolbarDrawerClosing: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar
  }
});

let tags = [];
let virtualBrowsers = [];

// 构建新的标签实体
class Tag {
  constructor(object) {
    this.key = shortid.generate();

    this.title = object.title == null ? "未知标题" : object.title;
    this.subTitle = object.subTitle == null ? "" : object.subTitle;
    this.icon = object.icon == null ? <DocumentIcon /> : object.icon;
    this.content = object.content == null ? {} : object.content;

    this.enableClose = object.enableClose == null ? true : object.enableClose;
    this.enableSelect =
      object.enableSelect == null ? true : object.enableSelect;

    this.titleBold = object.titleBold == null ? false : object.titleBold;
    this.titleItalic = object.titleItalic == null ? false : object.titleItalic;
    this.titleUnderline =
      object.titleUnderline == null ? false : object.titleUnderline;
    this.titleDeleteline =
      object.titleDeleteline == null ? false : object.titleDeleteline;
    this.titleColor = object.titleColor == null ? "#000" : object.titleColor;

    if (object.render == null) throw Error("未定义标签的渲染器！");
    this.render = object.render;
  }
}

function newTag(object) {
  tags.push(new Tag(object));
}

// 测试数据
newTag({
  title: TestData.threads[825413].title,
  subTitle: TestData.users[TestData.threads[825413].author].name,
  render: <WatchThreadRender thread={825413} />
});
newTag({
  title: TestData.forums["announcement-1"].name,
  icon: <WidgetsIcon />,
  render: <ForumRender forum="announcement-1" />
});

class VirtualBrowser {
  handleCallBack = (type, value) => {
    switch(type){
      case 'newTask':
        for(let i of value){
          console.log('Loading: ' + i);
          newBrowser(i);
        }
        break;
      case 'done':
        console.log('Done! ' + this.url);
        break;
      case 'error':
        console.error('There\'s someting wrong at this url :' + this.url)
        console.error(value);
        break;
      case 'log':
        console.log(value);
      default:
    }
  }

  constructor(url) {
    this.webview = <WebView url={url} callBack={this.handleCallBack} key={shortid.generate()} />
    this.url = url;
  }
}

function newBrowser(url) {
  for (let i of Object.keys(pageBindScript)) {
    for (let exprString of Object.keys(pageBindScript[i].url)) {
      // 如果匹配对应正则表达式，则凭此项对应的 preload 列表对 <webview /> 进行初始化
      let expr = new RegExp(exprString);
      if(expr.test(url)){
        virtualBrowsers.push(new VirtualBrowser(url));
        return;
      }
    }
  }
  // 没有任何匹配时，当然就要报错了
  throw Error("URL 解析错误：已阅，狗屁不通！"); 
}

// 测试虚拟浏览器
newBrowser("http://www.mcbbs.net/thread-835370-1-1.html", function(){console.log("success")});

// 窗口主体
class MainWindow extends React.Component {
  state = {
    leftBarType: "main",
    tag: "mainPage",
    aboutDialog: false,
    loading: false
  };

  handleOpenDevTools = () => {
    remote.getCurrentWebContents().openDevTools({ detach: true });
  }

  handleDrawerOpenUsers = () => {
    this.setState({ leftBarType: "users" });
  };

  handleDrawerOpenNavigation = () => {
    this.setState({ leftBarType: "navigation" });
  };

  handleDrawerOpenDocuments = () => {
    this.setState({ leftBarType: "documents" });
  };

  handleDrawerOpenSettings = () => {
    this.setState({ leftBarType: "settings" });
  };

  handleDrawerClose = () => {
    this.setState({ leftBarType: "main" });
  };

  handleCreateTagSelector = function (id) {
    return () => {
      this.mainRef.current.scrollTo(0, 0);
      this.setState({ tag: id });
    };
  };

  handleCreateTagDestoryer = function (id) {
    return () => {
      tags.splice(id, 1);
      this.setState({
        tag: tags.length <= 1 ? "mainPage" : tags[0].key
      });
    }
  }

  handleOpenAboutDialog = () => this.setState({ aboutDialog: true });

  handleCloseAboutDialog = () => this.setState({ aboutDialog: false });

  mainRef = React.createRef();

  render() {
    const { classes, theme } = this.props;

    try {
      return (
        <div className={classes.root}>
          <CssBaseline />
          <Drawer
            variant="permanent"
            className={classNames(classes.drawer, {
              [classes.drawerOpen]: this.state.leftBarType !== "main",
              [classes.drawerClose]: this.state.leftBarType === "main"
            })}
            classes={{
              paper: classNames({
                [classes.drawerOpen]: this.state.leftBarType !== "main",
                [classes.drawerClose]: this.state.leftBarType === "main"
              })
            }}
            open={this.state.leftBarType !== "main"}
          >
            {
              this.state.leftBarType === "documents" && (
                <div>
                  <div className={classes.toolbar}>
                    <Fade
                      in={this.state.leftBarType === "documents"}
                      timeout={500}
                    >
                      <IconButton onClick={this.handleDrawerClose}>
                        <ChevronLeftIcon />
                      </IconButton>
                    </Fade>
                  </div>
                  <Divider />
                  <List>
                    {tags.map((n) => {
                      return (
                        <ListItem
                          key={n.key}
                          button
                          onClick={this.handleCreateTagSelector(n.key)}
                          selected={this.state.tag === n.key}
                        >
                          {n.icon}
                          <ListItemText
                            primary={<Typography noWrap>{n.title}</Typography>}
                            secondary={n.subTitle}
                          />
                          {n.enableClose && (
                            <ListItemSecondaryAction>
                              <Fade
                                in={this.state.leftBarType === "documents"}
                                timeout={500}
                              >
                                <IconButton>
                                  <CloseIcon onClick={this.handleCreateTagDestoryer(n.key)} />
                                </IconButton>
                              </Fade>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      );
                    })
                    }
                    <ListSubheader>快速通道</ListSubheader>
                    <ListItem
                      button
                      onClick={this.handleCreateTagSelector("mainPage")}
                      selected={this.state.tag === 'mainPage'}
                    >
                      <HomeIcon />
                      <ListItemText primary="主页" />
                    </ListItem>
                    <ListItem button>
                      <SignInIcon />
                      <ListItemText
                        primary="签到"
                        secondary={"您今日还未签到！"}
                      />
                    </ListItem>
                    <ListItem button>
                      <StarIcon />
                      <ListItemText primary="收藏" />
                    </ListItem>
                    <ListItem button>
                      <TaskIcon />
                      <ListItemText primary="任务" />
                    </ListItem>
                  </List>
                </div>
              )}

            {this.state.leftBarType === "navigation" && (
              <div>
                <div className={classes.toolbar}>
                  <Fade
                    in={this.state.leftBarType === "navigation"}
                    timeout={500}
                  >
                    <IconButton onClick={this.handleDrawerClose}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </Fade>
                </div>
                <Divider />
                <List>
                  <ListSubheader>通知</ListSubheader>
                  <ListItem button>
                    <SendIcon />
                    <ListItemText primary="消息" secondary={"没有新消息"} />
                  </ListItem>
                  <ListItem button>
                    <NoticeIcon />
                    <ListItemText primary="我的帖子" secondary={"没有新通知"} />
                  </ListItem>
                  <ListItem button>
                    <SettingIcon />
                    <ListItemText primary="系统提醒" secondary={"没有新通知"} />
                  </ListItem>
                  <ListItem button>
                    <FaceIcon />
                    <ListItemText primary="坛友互动" secondary={"没有新通知"} />
                  </ListItem>
                </List>
              </div>
            )}

            {this.state.leftBarType === "settings" && (
              <div>
                <div className={classes.toolbar}>
                  <Fade
                    in={this.state.leftBarType === "settings"}
                    timeout={500}
                  >
                    <IconButton onClick={this.handleDrawerClose}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </Fade>
                </div>
                <Divider />
                <List>
                  <ListSubheader>个性化</ListSubheader>
                  <ListItem button>
                    <SettingIcon />
                    <ListItemText primary="本体设置" />
                  </ListItem>
                  <ListItem button>
                    <PaintIcon />
                    <ListItemText primary="主题" />
                  </ListItem>
                  <ListItem button onClick={this.handleOpenAboutDialog}>
                    <InfoIcon />
                    <ListItemText primary="关于" />
                  </ListItem>
                  <ListSubheader>插件控制</ListSubheader>
                  <ListItem button>
                    <StoreIcon />
                    <ListItemText primary="插件中心" />
                  </ListItem>
                  <ListItem button onClick={this.handleOpenDevTools}>
                    <SettingIcon />
                    <ListItemText primary="开发者控制" />
                  </ListItem>
                </List>
              </div>
            )}

            {this.state.leftBarType === "users" && (
              <div>
                <div className={classes.toolbar}>
                  <Fade in={this.state.leftBarType === "users"} timeout={500}>
                    <IconButton onClick={this.handleDrawerClose}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </Fade>
                </div>
                <Divider />
                <List>
                  <ListItem button>
                    <AddIcon />
                    <ListItemText primary="新增账户" />
                  </ListItem>
                </List>
              </div>
            )}

            <div className={classes.toolbarDrawerClosing}>
              <Fade in={this.state.leftBarType === "main"} timeout={500}>
                <IconButton
                  onClick={this.handleDrawerOpenUsers}
                  className={
                    this.state.leftBarType !== "main" ? " " + classes.hide : ""
                  }
                >
                  <AccountCircleIcon />
                </IconButton>
              </Fade>
            </div>
            <Divider />
            <Fade in={this.state.leftBarType === "main"} timeout={500}>
              <IconButton
                onClick={this.handleDrawerOpenDocuments}
                className={
                  this.state.leftBarType !== "main" ? " " + classes.hide : ""
                }
              >
                <DocumentIcon />
              </IconButton>
            </Fade>
            <Fade in={this.state.leftBarType === "main"} timeout={500}>
              <IconButton
                onClick={this.handleDrawerOpenNavigation}
                className={
                  this.state.leftBarType !== "main" ? " " + classes.hide : ""
                }
              >
                <ListIcon />
              </IconButton>
            </Fade>
            <Fade in={this.state.leftBarType === "main"} timeout={500}>
              <IconButton
                onClick={this.handleDrawerOpenSettings}
                className={
                  this.state.leftBarType !== "main" ? " " + classes.hide : ""
                }
              >
                <WidgetsIcon />
              </IconButton>
            </Fade>
            <Divider />
          </Drawer>
          <main className={classes.content} ref={this.mainRef}>
            {this.state.loading && <LinearProgress />}
            {
              (this.state.tag === "mainPage" && <MainPageRender />) || (
                <div key={this.state.tag}>
                  {tags.find(n => this.state.tag === n.key).render}
                </div>
              )
            }
            <div className={classes.hide}>
              {
                virtualBrowsers.map((n) => {
                  return n.webview;
                })
              }
            </div>
          </main>
          <Dialog
            open={this.state.aboutDialog}
            onClose={this.handleCloseAboutDialog}
            aria-labelledby="about-dialog"
          >
            <DialogTitle>关于</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1">作者：langyo</Typography>
                <Typography variant="subtitle1">当前版本：0.2.2</Typography>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleCloseAboutDialog} color="primary">
                OjbK
            </Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    } catch (e) {
      remote.getCurrentWebContents().openDevTools();
      throw e;
    }
  }
}

MainWindow.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MainWindow);