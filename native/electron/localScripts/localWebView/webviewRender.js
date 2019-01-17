import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import shortid from "shortid";

import { withStyles } from "@material-ui/core/styles";

import WebView from "./webview";

import pageBindScript from "../../scripts/forumWorker/pageBindScript";
import db from "../localDatabase/database";

const styles = theme => ({
    hide: {
        width: 0,
        height: 0,
        margin: 0,
        padding: 0,
        display: "none"
    }
});

class VirtualBrowser extends React.Component {
    state = {};
    virtualBrowsers = [];
    virtualBrowserCount = db.get("local.browserSettings.maxVirtalBrowserCount").value();
    virtualBrowserState = [];
    /*
        virtualBrowserState 的每一个元素为下述的其中一种值：
            - free : 空闲
            - loading : 正在加载页面
            - waiting : 正在等待主进程提供数据
            - error : 出错
    */

    hasLoad = false;

    timeStamp = [];
    taskStack = [];

    handleCallBack = function (id) {
        return (n) => {
            switch (n.state) {
                case 'newTask':
                    console.log('%cMainThread', 'color: blue;', 'Done!');
                    for (let i of n.newTask) {
                        console.log('%cMainThread', 'color: blue;', 'Loading: ' + i);
                        this.newBrowser("http://www.mcbbs.net/" + i);
                    }
                    this.checkBrowserStack();
                    break;
                case 'success':
                    console.log('%cMainThread', 'color: blue;', 'Done!');
                    this.checkBrowserStack();
                    break;
                case 'error':
                    console.log('%cMainThread', 'color: blue;', 'There\'s someting wrong at this url :' + this.url)
                    this.checkBrowserStack();
                    break;
                case 'log':
                    console.log('%cMainThread', 'color: blue;', 'Log data:');
                    console.log(n.data);
                    break;
                default:
            }
        }
    }

    checkBrowserStack = () => {
        for(let i = 0; i < this.virtualBrowserCount; ++i){
            // 检查哪个虚拟浏览器能用的，能就依次提取 taskStack 里的 URL
            if(this.virtualBrowserState[i] === 'free' && this.taskStack.length > 0){
                this.virtualBrowsers[i] = <WebView id={i} callBack={this.handleCallBack(i)} key={shortid.generate()} url={this.taskStack.pop()}/>
            }
        }
        // this.props.refreshFunction();
    }

    newBrowser = (url) => {
        for (let i of Object.keys(pageBindScript)) {
            for (let exprString of pageBindScript[i].url) {
                // 如果匹配对应正则表达式，则凭此项对应的 preload 列表对 <webview /> 进行初始化
                let expr = new RegExp(exprString);
                if (expr.test(url)) {
                    console.log('%cMainThread', 'color: blue;', "成功匹配 " + url);
                    this.taskStack.push(url);
                    this.checkBrowserStack();
                    this.hasLoad && this.setState({});
                    console.log(this.virtualBrowsers);
                    return;
                }
            }
        }
        // 没有任何匹配时，当然就要报错了
        throw Error("URL 解析错误：已阅，狗屁不通！");
    }

    render() {
        const { classes, theme } = this.props;

        return (
            <div className={classes.hide}>
                {this.virtualBrowsers.map(n => n)}
            </div>
        );
    }

    componentWillMount() {
        this.hasLoad = true;
    }

    componentWillUnmount() {
        this.hasLoad = false;
    }

    constructor() {
        super();
        for (let i = 0; i < this.virtualBrowserCount; ++i) {
            this.virtualBrowsers.push(<WebView id={i} callBack={this.handleCallBack(i)} key={shortid.generate()} />);
            this.virtualBrowserState.push('free');
        }
        console.log('%cMainThread', 'color: blue;', "已加载 Virtual Browser");

        // 以下为调试代码
        this.newBrowser("http://www.mcbbs.net/thread-672030-1-1.html");
    }
}

VirtualBrowser.propTypes = {
    refreshFunction: PropTypes.func,
    setProgressOpenFunction: PropTypes.func,
    setProgressCloseFunction: PropTypes.func
};

export default withStyles(styles)(VirtualBrowser);