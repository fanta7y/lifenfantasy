let err = false;
const http = require('http');
const express = require('express');
const fs = require('fs');
const bcrypt = require("bcrypt");
const path = require('path');
const multer = require('multer');
const mysql = require('mysql');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
let promocode = '17F-SKWNH&-L45W5M-201X';
require('dotenv').config();
let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads');
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});
let upload = multer({ storage: storage });
const app = express();
const session = require('express-session');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
function isAuth (req, res, next) {
    if (req.session.auth) {
        req.session.error = false;
        next();
    } else {
        index(promocode, "Ошибка: Вы не авторизованы!", req, res);
    }
}
function isAdmin(req, next) {
    if (req.session.admin == promocode) {
        let err = false;
        next();
    } else {
        index(promocode, "Ошибка: Недостаточно прав!", req, res);
    }
}
/* Путь к директории файлов ресурсов */
app.use(express.static('public'));

// Настройка шаблонизатора
app.set('view engine', 'ejs');

//Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
server.listen(1313, "0.0.0.0", () => {
    console.log('Запуск сервера...');
    setTimeout(function() {
        console.log('Сервер запущен');
    }, 1300);    
});

app.use(session({
    secret: 'Secret',
    resave: false,
    saveUninitialized: true
}));
io.on('connection', (socket, req, res) => {
    socket.on('chat message', (msg) => {
        connection.query(
            "INSERT INTO msg (time, sender, text, team) VALUES (NOW(), ?, ?, '1')",
            [[msg.user], [msg.content]],
            (err, data, fields) => {
                if (err) {
                    console.log(err);
                }                            
            }
        );
        io.emit('chat message', {
            'emoji': msg.emoji,
            'content': msg.content,
            'user': msg.user,
    });
        //'<span class="nickname">' + msg.user + '</span>' + ': ' + msg.content);
    });
});
app.get('/msg', isAuth, (req, res) => {
    // select from database and pass data to render
        connection.query("SELECT Date_format(time, '%k:%i') as time, id, sender, text FROM msg WHERE team='1' order by time asc", (err, data, fields) => {
        if(err) {
            console.log(err);
        }
    
    console.log(data);
    active = 'pass';
    connection.query("SELECT name, vkid, emoji FROM users", (err, users, fields) => {
        if(err) {
            console.log(err);
        }
        connection.query("SELECT id FROM msg ORDER BY id DESC LIMIT 1;", (err, ids, fields) => {
        res.render('msg', {
            'users': users,
            'sess': req.session.vkid,
            'sessava': req.session.emoji,
            'sessname': req.session.name,
            'auth': true,
            'act': active,
            'mess': data,
            'ava': req.session.emoji,
            'lastid': (Number(ids[0]) + 1)
        });
        });
    });
    });
});

    // });
    app.post('/upload', upload.single('file'), async (req, res, next) => {
        const { name, text, location_id } = req.body;
        const { originalname } = req.file;
            await prisma.item.create({
                data: {
                    title: name,
                    text,
                    filename: originalname,
                    location_id: Number(location_id),
                }
            });
            res.redirect('/');
        });
        app.post('/submit', (req, res, next) => {
            connection.query("SELECT * FROM offer WHERE id=?", [req.body.id], (err, data, fields) => {
                if(err) {
                    console.log(err);
                }
                connection.query("INSERT INTO items(title, text, filename) VALUES (?, ?, ?)", 
                [[data[0].title], [data[0].text], [data[0].image]], (err, data, fields) => {
                if(err) {
                    console.log(err);
                }
                connection.query("DELETE FROM offer WHERE id = ?", [req.body.id], function(err, data, fields){
                    if(err) {
                        console.log(err);
                    }
                });
                res.redirect('/');
            });
            });
        });
            
    let active;
    app.post('/offer', upload.single('file'), (req, res, next) => {
        console.log('_____________')
        console.log(req.body.name);
        console.log(req.body.text);
        console.log(req.file.originalname);
        connection.query("INSERT INTO offer (title, text, image, author) VALUES (?, ?, ?, ?)", 
        [[req.body.name], [req.body.text], [req.file.originalname], [req.body.author]], (err, data, fields) => {
            if(err) {
                console.log(err);
            }
            console.log(req.body.author);
            res.redirect('/');
        });
        });
app.get('/page', (req, res) => {
res.redirect('/page/' + req.session.vkid);
})
async function index(promocode, mirror, req, res){
    const item = await prisma.item.findMany({
        include: {
            location: true,
            categories: {
                include: {
                    category: true,
                }
            },
        }
    });
    const cats = await prisma.category.findMany({
    });
    const off = await prisma.Offer.findMany({
    });
    console.log(item);
    res.render('index', {
        'many': off.length,
        'items': (item) ? item : {},
        'error': mirror,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,
        'admin': req.session.admin,
        'promocode': promocode,
        'act': "index",
        'dot': (cats) ? cats : {}
                
    });
}
    app.get('/', (req, res) => {
        index(promocode, false, req, res);
    });

app.get('/photo',  (req,res) => {
    active = 'app';
    res.render('form', {
        'admin': req.session.admin,
        'promocode': promocode,
        'act': active,
        'vkid': req.session.vkid,
        'auth': req.session.auth,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,
        'act': active,
    });
})

// 'name': req.session.name,
// 'vkid': req.session.vkid,
// 'id': req.session.id,
// 'emoji': req.session.emoji,
// 'userinfo': req.session.text,
// 'tel': req.session.tel,
// 'gender': req.session.gender,
// 'auth': req.session.auth,
app.get('/news-video', (req,res) => {
    active = 'nv';
    res.render('news-video', {
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active
    });
})

app.get('/news-post', (req,res) => {
    active = 'np';
    res.render('news-post', {
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active,

    }
    );
})

app.get('/app', (req,res) => {
    active = 'app';
    res.render('app', {
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active,

    });
});
app.post('/delete', isAuth, isAdmin, (req, res) => {
        connection.query("DELETE FROM items WHERE id = ?", [[req.body.id]], (err, data, fields) => {
            if(err) {
                console.log(err);
            }
            res.redirect('/');
        });
});
app.post('/update', isAdmin, (req,res) => {
    let source = Number(req.body.id);
    connection.query("UPDATE items SET title=?, text=? WHERE id = ?",
    [[req.body.title], [req.body.text], [req.body.id]],(err, data, fields) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
});
app.get('/passport/reg', (req,res) => {
    active = 'pass';
    res.render('reg', {
        'error': false,
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active,

    }
    );
});
app.get('/passport/input', (req,res) => {
    active = 'pass';
    let loginerr = '';
    res.render('input', {
        'error': loginerr,
        'act': active,
        'name': req.session.name,
        'vkid': req.session.vkid,
        'id': req.session.id,
        'emoji': req.session.emoji,
        'userinfo': req.session.text,
        'tel': req.session.tel,
        'gender': req.session.gender,
        'auth': req.session.auth,        
        'act': active,

    }
    );
});
    // } else {
    //     alert('Ошибка: вы не заполнили одно из обязательных полей!');
    // }

    app.post('/reg', (req, res) => {
        if(req.body.vkid != '' && req.body.username != '' && req.body.userpass != '' && req.body.phone != '' && req.body.date != '') {
            let salt = 10;
            const { username, vkid, userpass, phone, Gender, text, emoji, date, private} = req.body;
            bcrypt.hash(userpass, salt, async (err, password) => {
                console.log(password);
                console.log(Gender);
                console.log(phone);
                        await prisma.user.create({
                            data: {
                                username: username,
                                vkid: vkid,
                                password: password,
                                Phone: Number(phone),
                                Gender: Number(Gender),
                                Info: text,
                                Emoji: emoji,
                                date: date,
                                private: private
                            }
                        });
                        let a = await prisma.user.findFirst({
                            where: {
                                vkid: vkid,
                                password: password,
                            }
                        })
                        let data = [];
                        data.push(a);
                                console.log(data);
                                console.log('data');
                                req.session.admin = data[0].private;
                                req.session.name = data[0].name;
                                req.session.vkid = data[0].vkid;
                                req.session.id = data[0].id;
                                req.session.emoji = data[0].emoji;
                                req.session.text = data[0].info;
                                req.session.tel = data[0].phone;
                                req.session.gender = data[0].gender;
                                req.session.auth = true;

                                res.redirect('/');
            });
        } else {
            active = 'pass';
            res.render('reg', {
                'error': 'Не оставляйте поля пустыми!',
                'name': req.session.name,
                'vkid': req.session.vkid,
                'id': req.session.id,
                'emoji': req.session.emoji,
                'userinfo': req.session.text,
                'tel': req.session.tel,
                'gender': req.session.gender,
                'auth': req.session.auth,        
                'act': active,
            });
        }
    });

    app.post('/login', async (req, res) => {
        let error = false;
        let data = new Array;
        data.push(await prisma.user.findFirst({
            where: {
                vkid: req.body.vkid,
            }
        }));

                if(data.length != 0) {
                bcrypt.compare(req.body.pass, data[0].password, (err, result) => {
                    console.log(result);
                
                console.log(data);
            if(result) {
                console.log(data[0].id);
                req.session.admin = data[0].private;
                req.session.name = data[0].name;
                req.session.vkid = data[0].vkid;
                req.session.id = data[0].id;
                req.session.emoji = data[0].emoji;
                req.session.text = data[0].info;
                req.session.tel = data[0].phone;
                req.session.gender = data[0].gender;
                req.session.auth = true;
                res.redirect('/');
            } else{
                res.render('input', {
                    'error': 'Ошибка: пользователь не найден. Проверьте правильность написания логина и пароля!',
                    'act': active,
                    'name': req.session.name,
                    'vkid': req.session.vkid,
                    'id': req.session.id,
                    'emoji': req.session.emoji,
                    'userinfo': req.session.text,
                    'tel': req.session.tel,
                    'gender': req.session.gender,
                    'auth': req.session.auth,        
                    'act': active,
                });
                }
            });
            } else {
                res.render('input', {
                    'error': 'Ошибка: пользователь не найден. Проверьте правильность написания логина и пароля!',
                    'act': active,
                    'name': req.session.name,
                    'vkid': req.session.vkid,
                    'id': req.session.id,
                    'emoji': req.session.emoji,
                    'userinfo': req.session.text,
                    'tel': req.session.tel,
                    'gender': req.session.gender,
                    'auth': req.session.auth,        
                    'act': active,
                });
            }
        });  

    app.post('/logout', isAuth, (req, res) => {
        req.session.auth = false;  
        res.redirect('/');
    });
    app.post('/items', (req, res) => {
        let offset = (req.body.offset);
        connection.query("SELECT * FROM items limit 4 offset ?", [[offset]], (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            console.log(data);
                res.status(200).send(data);
            });
    });
    

    app.get('/offerlist',  async (req, res) => {
        // connection.query("SELECT * FROM offer order by id desc limit ? offset ?", [[ipp], [lots]], (err, data, fields) => {
        const data = await prisma.Offer.findMany({

        });
            active = 'index';
            res.render('offers', {
                'admin': req.session.admin,
                'promocode': promocode,
                'error': req.session.error,
                'name': req.session.name,
                'vkid': req.session.vkid,
                'id': req.session.id,
                'emoji': req.session.emoji,
                'userinfo': req.session.text,
                'tel': req.session.tel,
                'gender': req.session.gender,
                'auth': req.session.auth,
                'act': active,
                'Items': data,
            });
        }
        );
    app.post('/deleteof', isAuth, isAdmin, (req, res) => {
        connection.query("DELETE FROM offer WHERE id = ?", [req.body.id], function(err, data, fields){
            if(err) {
                console.log(err);
            }
            res.redirect('/');
        });
});
app.post('/delmsg', (req, res) => {
    connection.query("DELETE FROM msg WHERE id = ?", [req.body.msgid], function(err, data, fields){
        if(err) {
            console.log(err);
        }
        res.redirect('/msg');
    });
});
    app.post('/addevent', isAuth, (req, res, next) => {
        connection.query("INSERT INTO events(id, name, date, type, description, everyYear, color) VALUES (?, ?, ?, ?, ?, ?)", 
        [[id], [req.body.name], [req.body.date], [req.body.type], [req.body.desc], [req.body.everyYear], [req.body.color]], (err, data, fields) => {
            if(err) {
                console.log(err);
            }
            res.redirect('/table');
        });
    });

    app.post('/cat', (req, res) => {
        if(req.body.name != '') {
        connection.query(
            "INSERT INTO category (name, descr, color) VALUES (?, ?, ?)",
            [[req.body.name], [req.body.descr], [req.body.clr]],
            (err, data, fields) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/');
            }
        );
        } else {
            let error = "Ошибка: название не может быть пустым!";
            index(promocode, error, req, res);
        }
    });
    app.post('/dropcat', (req, res) => {
        console.log(req.body.plc);
        console.log('up');
        console.log(req.body.id);
        connection.query(
            "delete from itemstocat where cat_id=? and item_id=?", 
            [[req.body.plc], [req.body.id]],
            (err, data, fields) => {
                if (err) {
                    console.log(err);
                }
                res.redirect('/catto/' + req.body.id);
            }
        );
    });
    app.get('/catform', isAuth, (req, res) => {
        res.render('catadd', {
            'act': "app",    
            'auth': req.session.auth
        });
    })
    app.get('/page/:id', (req, res) => {
        connection.query("SELECT * FROM users WHERE vkid=?", [[req.params.id]],
        (err, data, fields) => {
            if (err) {
                console.log(err);
            }
            res.render('page', {
                'userdata': data[0],
                'params': req.params.id,
                'admin': req.session.admin,
                'promocode': promocode,
                'act': "pass",
                'Items': data,
                'name': req.session.name,
                'vkid': req.session.vkid,
                'userId': req.session.id,
                'emoji': req.session.emoji,
                'userinfo': req.session.text,
                'tel': req.session.tel,
                'gender': req.session.gender,
                'auth': req.session.auth,
            });
        });
    }); 

    app.get('/items/:id', async (req, res) => {
        const { id } = req.params;
        const data = await prisma.item.findFirst({
            where: {
                id: Number(id),
            },
            include: {
                location: true,
                categories: {
                    include: {
                        category: true,
                    }
                },
            }
        });
        let a = new Array;
        a.push(data);
        let b = a[0].categories;

        b = b.map(el => {
            return el.category;
        });
        console.log(b);
        console.log("DATA сверху")
            res.render('item', {
                'thisa': b,
                'params': req.params.id,
                'admin': req.session.admin,
                'promocode': promocode,
                'act': "index",
                'Items': a,
                'name': req.session.name,
                'vkid': req.session.vkid,
                'userId': req.session.id,
                'emoji': req.session.emoji,
                'userinfo': req.session.text,
                'tel': req.session.tel,
                'gender': req.session.gender,
                'auth': req.session.auth,
            });
    });

app.get('/catto/:id', isAuth, (req,res) => {
    connection.query("Select * from itemstocat where item_id = ?", [[req.params.id]], (err, item, fields) => {
        if (err) throw err;
        if (typeof item !== 'undefined' && item.length > 0) {
            item = item.map(el => {
                return el.cat_id;
            });
            connection.query("select * from category where id = ? or id in ?", [[item[0]], [item]], (err, data, fields ) => {
                if (err) throw err;
                connection.query("Select * from category where id NOT IN ?", [[item]], (err, notin, fields) => {
                    res.render('numb', {
                        'data': data,
                        'notin': notin,
                        'params': req.params.id,
                        'admin': req.session.admin,
                        'promocode': promocode,
                        'Items': data,
                        'name': req.session.name,
                        'vkid': req.session.vkid,
                        'userId': req.session.id,
                        'emoji': req.session.emoji,
                        'userinfo': req.session.text,
                        'tel': req.session.tel,
                        'gender': req.session.gender,
                        'auth': req.session.auth,
                        'act': "app"
                    });
                });
            });
        } else { 
            connection.query("Select * from category", (err, notin, fields) => {
                res.render('numb', {
                    'data': [],
                    'notin': notin,
                    'params': req.params.id,
                    'admin': req.session.admin,
                    'promocode': promocode,
                    'name': req.session.name,
                    'vkid': req.session.vkid,
                    'userId': req.session.id,
                    'emoji': req.session.emoji,
                    'userinfo': req.session.text,
                    'tel': req.session.tel,
                    'gender': req.session.gender,
                    'auth': req.session.auth,
                    'act': "app"
                });
            });
        }
    })
        // connection.query("select cat_id from itemstocat where item_id=?", [[req.params.id]], (err, numb, fields) => {
        //     if (err) {
        //         console.log(err);
        //     }
        //     numb = numb.map(el => {
        //         return el.cat_id;
        //     });
        //     if(numb.length != 0) {
        //     connection.query("select * from category where id = ? or id in ?", [[numb[0]], [numb]], (err, data, fields) => {
        //         if (err) {
        //             console.log(err);
        //         }
        //         connection.query("select * from category", (err, vars, fields) => {
        //             res.render('numb', {
        //                 'vars': vars,
        //                 'data': data,
        //                 'numb': numb,
        //                 'params': req.params.id,
        //                 'admin': req.session.admin,
        //                 'promocode': promocode,
        //                 'Items': data,
        //                 'name': req.session.name,
        //                 'vkid': req.session.vkid,
        //                 'userId': req.session.id,
        //                 'emoji': req.session.emoji,
        //                 'userinfo': req.session.text,
        //                 'tel': req.session.tel,
        //                 'gender': req.session.gender,
        //                 'auth': req.session.auth,
        //                 'act': "app"
        //             });
        //         });
        //     });
        // } else {
        //     connection.query("select * from category", (err, vars, fields) => {
        //         res.render('numb', {
        //             'vars': vars,
        //             'data': [],
        //             'numb': numb,
        //             'params': req.params.id,
        //             'admin': req.session.admin,
        //             'promocode': promocode,
        //             'name': req.session.name,
        //             'vkid': req.session.vkid,
        //             'userId': req.session.id,
        //             'emoji': req.session.emoji,
        //             'userinfo': req.session.text,
        //             'tel': req.session.tel,
        //             'gender': req.session.gender,
        //             'auth': req.session.auth,
        //             'act': "app"
        //         });
        //     });
        // }
        // });
    });
app.post('/catadd', (req, res) => {
    let cats = true;
    if (req.body.catID != []) {
    cats = req.body.catID;
    }
    let items = req.body.id;
    console.log(cats);
    if(cats != undefined) {
        let b = new Array;
        let a = new Array;
        for(let i = 0; i < cats.length; i++) {
            b.push(items);
            b.push(cats[i]);
            a.push(b);
            b = [];
        }
        console.log(a);
    connection.query("Delete from itemstocat where item_id=?", [[items]], (err, data, fields) => {
        if (err) throw err;
        connection.query("Insert into itemstocat (item_id, cat_id) values ?", [a], (err, data, fields) => {
            if (err) throw  err;
            res.redirect('/catto/' + items);
        })
    })
    } else {
        connection.query("Delete from itemstocat where item_id=?", [[items]], (err, data, fields) => {
            if (err) throw err;
            res.redirect('/catto/' + items);
        });
    }
});

app.get('/home/:id', (req, res) => {
    if(req.params.id == 'all') {
        res.redirect('/');
    }
    const itemsPerPage = 4;
    connection.query("Select count(id) as count from items", (err, data, fields) => {
        const itemsCount = (data[0].count);
        const pagesCount = Math.ceil(itemsCount / itemsPerPage);
    connection.query("Select item_id from itemstocat where cat_id = ?", [[req.params.id]], (err, want, fields) => {
    if (err) console.log(err);
    want = want.map(el => {
        return el.item_id;
    });

    console.log(want);
    if(want.length == 0) {
        mirror = 'Ошибка: В данной категории нет объектов!';
        index(promocode, mirror, req, res);
    } else {
    connection.query("Select * from items where id in ?", [[want], [itemsPerPage]], (err, data, fields) => {
        if (err) console.log(err);
        let mirror;       
        connection.query("SELECT * from category", (err, dot, fields) => {

                mirror = false;
            res.render('index', {
                'items': data,
                'all': false,
                'error': mirror,
                'dot': dot,
                'act': 'index',
                'params': req.params.id,
                'admin': req.session.admin,
                'promocode': promocode,
                'Items': data,
                'name': req.session.name,
                'vkid': req.session.vkid,
                'userId': req.session.id,
                'emoji': req.session.emoji,
                'userinfo': req.session.text,
                'tel': req.session.tel,
                'gender': req.session.gender,
                'auth': req.session.auth,
            });
        });
    });
    }
});
});
});