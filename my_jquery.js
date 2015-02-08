/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-01-20 11:56:46
 * @version $Id$
 * my jquery
 */

(function (window, undefined) {
	var jQuery = {};
	if( typeof window === "object" && typeof window.document === "object"){
		window.jQuery = window.$ = jQuery;
	}
}(window));


jQuery = function (selector, context) {
	return jQuery.fn.init( selector, context, rootjQuery );
};

jQuery.prototype = function () {
	init : function () {
		return this;
	}
};

jQuery.extend = jQuery.fn.extend = function() {
    var src, copyIsArray, copy, name, options, clone,
        target = arguments[0] || {},    // 常见用法 jQuery.extend( obj1, obj2 )，此时，target为arguments[0]
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {    // 如果第一个参数为true，即 jQuery.extend( true, obj1, obj2 ); 的情况
        deep = target;  // 此时target是true
        target = arguments[1] || {};    // target改为 obj1
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !jQuery.isFunction(target) ) {  // 处理奇怪的情况，比如 jQuery.extend( 'hello' , {nick: 'casper})~~
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if ( length === i ) {   // 处理这种情况 jQuery.extend(obj)，或 jQuery.fn.extend( obj )
        target = this;  // jQuery.extend时，this指的是jQuery；jQuery.fn.extend时，this指的是jQuery.fn
        --i;
    }

    for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) { // 比如 jQuery.extend( obj1, obj2, obj3, ojb4 )，options则为 obj2、obj3...
            // Extend the base object
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent never-ending loop
                if ( target === copy ) {    // 防止自引用，不赘述
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                // 如果是深拷贝，且被拷贝的属性值本身是个对象
                if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                    if ( copyIsArray ) {    // 被拷贝的属性值是个数组
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];

                    } else {    被拷贝的属性值是个plainObject，比如{ nick: 'casper' }
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[ name ] = jQuery.extend( deep, clone, copy );  // 递归~

                // Don't bring in undefined values
                } else if ( copy !== undefined ) {  // 浅拷贝，且属性值不为undefined
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
}



//假设传入进来的选择器是：div > p + .aaron[type="checkbox"], #id:first-child
//这里可以分为两个规则：div > p + .aaron[type="checkbox"] 以及 #id:first-child
//返回的需要是一个Token序列
//Sizzle的Token格式如下 ：{value:'匹配到的字符串', type:'对应的Token类型', matches:'正则匹配到的一个结构'}
function tokenize( selector, parseOnly ) {
    var matched, match, tokens, type,
        soFar, groups, preFilters,
        cached = tokenCache[ selector + " " ];
  //这里的soFar是表示目前还未分析的字符串剩余部分
  //groups表示目前已经匹配到的规则组，在这个例子里边，groups的长度最后是2，存放的是每个规则对应的Token序列

    //如果cache里边有，直接拿出来即可
    if ( cached ) {
        return parseOnly ? 0 : cached.slice( 0 );
    }

    //初始化
    soFar = selector;
    groups = []; //这是最后要返回的结果，一个二维数组

    //比如"title,div > :nth-child(even)"解析下面的符号流
    // [ [{value:"title",type:"TAG",matches:["title"]}],
    //   [{value:"div",type:["TAG",matches:["div"]},
    //    {value:">", type: ">"},
    //    {value:":nth-child(even)",type:"CHILD",matches:["nth",
    //     "child","even",2,0,undefined,undefined,undefined]}
    //   ]
    // ]
    //有多少个并联选择器，里面就有多少个数组，数组里面是拥有value与type的对象

    //这里的预处理器为了对匹配到的Token适当做一些调整
    //自行查看源码，其实就是正则匹配到的内容的一个预处理
    preFilters = Expr.preFilter;

    //递归检测字符串
    //比如"div > p + .aaron input[type="checkbox"]"
    while ( soFar ) {

        // Comma and first run
        // 以第一个逗号切割选择符,然后去掉前面的部分
        if ( !matched || (match = rcomma.exec( soFar )) ) {
            if ( match ) {
                //如果匹配到逗号
                // Don't consume trailing commas as valid
                soFar = soFar.slice( match[0].length ) || soFar;
            }
            //往规则组里边压入一个Token序列，目前Token序列还是空的
            groups.push( tokens = [] );
        }

        matched = false;

        // Combinators
        //将刚才前面的部分以关系选择器再进行划分
        //先处理这几个特殊的Token ： >, +, 空格, ~
        //因为他们比较简单，并且是单字符的
        if ( (match = rcombinators.exec( soFar )) ) {
            //获取到匹配的字符
            matched = match.shift();
            //放入Token序列中
            tokens.push({
                value: matched,
                // Cast descendant combinators to space
                type: match[0].replace( rtrim, " " )
            });
            //剩余还未分析的字符串需要减去这段已经分析过的
            soFar = soFar.slice( matched.length );
        }

        // Filters
        //这里开始分析这几种Token ： TAG, ID, CLASS, ATTR, CHILD, PSEUDO, NAME
        //将每个选择器组依次用ID,TAG,CLASS,ATTR,CHILD,PSEUDO这些正则进行匹配
        //Expr.filter里边对应地 就有这些key
    /**
     *
     *
     *matchExpr 过滤正则
        ATTR: /^\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)[\x20\t\r\n\f]*(?:([*^$|!~]?=)[\x20\t\r\n\f]*(?:(['"])((?:\\.|[^\\])*?)\3|((?:\\.|[\w#-]|[^\x00-\xa0])+)|)|)[\x20\t\r\n\f]*\]/
        CHILD: /^:(only|first|last|nth|nth-last)-(child|of-type)(?:\([\x20\t\r\n\f]*(even|odd|(([+-]|)(\d*)n|)[\x20\t\r\n\f]*(?:([+-]|)[\x20\t\r\n\f]*(\d+)|))[\x20\t\r\n\f]*\)|)/i
        CLASS: /^\.((?:\\.|[\w-]|[^\x00-\xa0])+)/
        ID: /^#((?:\\.|[\w-]|[^\x00-\xa0])+)/
        PSEUDO: /^:((?:\\.|[\w-]|[^\x00-\xa0])+)(?:\(((['"])((?:\\.|[^\\])*?)\3|((?:\\.|[^\\()[\]]|\[[\x20\t\r\n\f]*((?:\\.|[\w-]|[^\x00-\xa0])+)[\x20\t\r\n\f]*(?:([*^$|!~]?=)[\x20\t\r\n\f]*(?:(['"])((?:\\.|[^\\])*?)\8|((?:\\.|[\w#-]|[^\x00-\xa0])+)|)|)[\x20\t\r\n\f]*\])*)|.*)\)|)/
        TAG: /^((?:\\.|[\w*-]|[^\x00-\xa0])+)/
        bool: /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i
        needsContext: /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i
     *
     */
        //如果通过正则匹配到了Token格式：match = matchExpr[ type ].exec( soFar )
        //然后看看需不需要预处理：!preFilters[ type ]
        //如果需要 ，那么通过预处理器将匹配到的处理一下 ： match = preFilters[ type ]( match )

        for ( type in Expr.filter ) {

            if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
                (match = preFilters[ type ]( match ))) ) {
                matched = match.shift();
                //放入Token序列中
                tokens.push({
                    value: matched,
                    type: type,
                    matches: match
                });
                //剩余还未分析的字符串需要减去这段已经分析过的
                soFar = soFar.slice( matched.length );
            }
        }

         //如果到了这里都还没matched到，那么说明这个选择器在这里有错误
            //直接中断词法分析过程
           //这就是Sizzle对词法分析的异常处理
        if ( !matched ) {
            break;
        }
    }

    // Return the length of the invalid excess
    // if we're just parsing
    // Otherwise, throw an error or return tokens
    //放到tokenCache函数里进行缓存
    //如果只需要这个接口检查选择器的合法性，直接就返回soFar的剩余长度，倘若是大于零，说明选择器不合法
    //其余情况，如果soFar长度大于零，抛出异常；否则把groups记录在cache里边并返回，
    return parseOnly ?
        soFar.length :
        soFar ?
            Sizzle.error( selector ) :
            // Cache the tokens
            tokenCache( selector, groups ).slice( 0 );
}