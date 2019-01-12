/*
function Promise(executor){
    let that = this;
    that.value = undefined;
    that.reason = undefined;
    that.status = "pending"
    function resolve(value){
        if(that.status==="pending"){
            that.status = "fulfilled"
            that.value = value;

        }
    }
    function reject(reason){
        if(that.status==="pending"){
            that.status = "rejected"
            that.reason = reason;
            
        }
    }

    executor(resolve,reject)
}

Promise.prototype.then = function(onFulfiled,onRejeted){
    let that = this;
    if(that.status === "fulfilled"){
        onFulfiled(that.value)
    }
    if(that.status === "rejected"){
        onFulfiled(that.reason)
    }

}

*/

//base es6


const PENDING = "pending";
const REJECTED = "rejected";
const FULFILLED = "fulfilled";


let resolvePromise = (promise2, x, resolve, reject)=> {
  if (promise2 === x) {  // 循环引用了
    return reject(new TypeError('循环引用'))
  }
  // x不一定是谁的promise, 可能会成功失败都调用
  let called;
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then;
      if (typeof then === 'function') { // 判定他是一个promise
        then.call(x,y => { // 调用返回的promise,可能这个promise resolve的结果又是一个promise 那就递归解析promise
          if (called) return; // 防止这个promise 既调用了成功又调用了失败
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        })
      } else {
        resolve(x); // 这就是一个普通对象 {}  {then:{}}
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x); // 当前x 是一个普通值
  }
}

class Promise {
    constructor(executor){
        let that = this;
        that.value=undefined;
        that.reason=undefined;
        that.status = PENDING;
        that.onResolvedCallbacks = [];
        that.onRejectedCallbacks = [];

        let resolve = (value)=>{
            if(that.status===PENDING){
                that.status = FULFILLED;
                that.value = value;
                that.onResolvedCallbacks.forEach(l=>l());
            }
        }
        let reject = (reason)=>{
            if(that.status===PENDING){
                that.status = REJECTED;
                that.value = reason;
                that.onRejectedCallbacks.forEach(r=>r());
            }
        }
        try{
            executor(resolve,reject)
        }catch(e){
            reject(e);
        }
    }   
    then(onFulfiled, onRejected){
        onFulfiled = typeof onFulfiled === 'function' ? onFulfiled : data=> (data)
            
          onRejected = typeof onRejected === 'function' ? onRejected : err => {
            throw err;
          }
          let that = this;
          let promise2;
          // 默认返回一个新的promise，需要将成功的函数和失败的函数返回结果来判断promise2是成功还是失败
          promise2 = new Promise((resolve, reject) => {
            if (that.status === 'fulfilled') {
              setTimeout(() => {
                try {
                  let x = onFulfiled(that.value); // x=100;
                  resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                  reject(e);
                }
              }, 0);
            }
            if (that.status === 'rejected') {
              setTimeout(() => {
                try {
                  let x = onRejected(that.reason);
                  resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                  reject(e);
                }
              }, 0);
            }
            if (that.status === 'pending') {
              that.onResolvedCallbacks.push(()=>{
                setTimeout(() => {
                  try {
                    let x = onFulfiled(that.value);
                    resolvePromise(promise2, x, resolve, reject);
                  } catch (e) {
                    reject(e);
                  }
                }, 0);
              });
              that.onRejectedCallbacks.push( ()=> {
                setTimeout(() => {
                  try {
                    let x = onRejected(that.reason);
                    resolvePromise(promise2, x, resolve, reject);
                  } catch (e) {
                    reject(e);
                  }
                }, 0);
              })
            }
          });
          return promise2;
    }
}


Promise.deferred = Promise.defer = ()=> {
    var defer = {};
    defer.promise = new Promise((resolve, reject)=> {
      defer.resolve = resolve;
      defer.reject = reject;
    })
    return defer;
  }

module.exports = Promise;



