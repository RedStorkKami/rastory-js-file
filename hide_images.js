prev_start_n = -1 // Предыдущее значение номера первой картинки из тех что нужно show
prev_end_n = -1  // Предыдущее значение номера последней картинки из тех что нужно show

function hide_images(colors_and_image_n, all_images_count, editions_to_hide) {


    // Find current color
    current_color_selected = $('.t-store__prod-popup__info').find('.t-product__option-item_active').find("span").text()
    // Текущее активное изображение
    current_image_n = $(".t-slds__thumbsbullet-wrapper.t-align_center").find(".t-slds__bullet_active").attr("data-slide-bullet-for")


    // Find what images should be shown for current color
    start_n = -1
    end_n = -1
    colors_and_image_n_len = colors_and_image_n.length
    colors_and_image_n.forEach(function(item, i, colors_and_image_n){
        //console.log("Перебор " + i)
        //console.log(item[0] + " == " + current_color_selected)
        if (item[0] == current_color_selected){ // Если текущая ячейка массива в [0] содержит интересующий товар
            //console.log("^^ TRUE ^^")
            start_n = item[1] // Тогда [1] этой ячейки будет стартом
            // Проверяем найден ли корректный конец
            correct_end = false
            try_i = 1
            // i = 6 , try_i = 1
            while ( try_i + i <= colors_and_image_n_len && correct_end == false ){
                // Проверяем не является ли вариант, по которому мы хотим определить последний элемент текущего варианта, заблокированным
                try_color_name = colors_and_image_n[i+try_i][0]
                try_image_number = colors_and_image_n[i+try_i][1]
                if (!editions_to_hide.includes(try_color_name)){
                    end_n = try_image_number - 1
                    if (end_n => start_n) {
                        correct_end = true
                    }
                }
                try_i = try_i + 1
            }
        }
    });


    // Код будем выполнять только если изменились номера картинок которые необходимо отобразить \ скрыть
    if (prev_start_n != start_n || prev_end_n != end_n){

        console.log("[hide_images] RUN hide_images(" + colors_and_image_n + ";" + all_images_count + ")")
        console.log("[hide_images] current_color_selected: " + current_color_selected)
        console.log("[hide_images] current_image_n: " + current_image_n)
        console.log("[hide_images] start_n for this color: " + start_n)
        console.log("[hide_images] end_n for this color: " + end_n)

        prev_start_n = start_n
        prev_end_n = end_n
        // Hide unused images
        i = all_images_count
        while (i > 0) {
            if (i > end_n || i < start_n){
                console.log("Hide() - " + i)
                $('[data-slide-bullet-for="'+ i + '"]').hide(); // HIDE
            } else {
                console.log("Show() - " + i)
                $('[data-slide-bullet-for="'+ i + '"]').show()
            }
            i = i - 1
        }
        console.log("[hide_images] ENDFUNC hide_images")
    }


    // Repreat
    setTimeout(function() {
        hide_images(colors_and_image_n, all_images_count, editions_to_hide);
    }, 200)
}

function hide_editions(products_blacklist){
    // Находим все блоки с товарами на странице
    current_color_selected = $('.t-store__prod-popup__info').find('.t-product__option-item_active').find("span").text()

    // ЧАСТЬ 1. ДЛЯ КАРТОЧКИ ТОВАРА
    current_name = $('.js-store-prod-name.t-name_xl').first().text()
    console.log("[hide_editions] current_name:" + current_name)
    console.log(current_name)

    // Проверяем есть ли в черном списке
    editions_to_hide = []
    products_blacklist.forEach(function callback(v, k) {
        bl_product_name = v[0]
        console.log("[hide_editions] current_name:" + current_name)
        console.log("[hide_editions] bl_product_name:" + bl_product_name)
        if (current_name == bl_product_name) {
            console.log("[hide_editions] blacklisted!")
            editions_to_hide = v[1]
        }
    });
    console.log("[hide_editions] editions_to_hide:" + editions_to_hide)
    console.log(editions_to_hide)

    // Если нужно скрыть, то скрываем
    if (!editions_to_hide == []){
        circles = $("div.js-product-controls-wrapper > div:nth-child(1) > form > label.t-product__option-item.t-product__option-item_buttons.t-product__option-item_color", "div.js-store-product.js-product.t-store__product-popup")

        console.log("[hide_editions] circles:")
        console.log(circles)

        circles.each(function() {
            var text = $(this).find("span").text();
            if (editions_to_hide.includes(text)) {
                $(this).addClass("t-product__option-item_disabled");
            }
        });

    }

    // ЧАСТЬ 2. ДЛЯ ОБЩЕГО МЕНЮ
    // ЧАСТЬ 3. ДЛЯ ОБЩЕГО МЕНЮ
    return editions_to_hide
}

function get_data(json_data){
    data = json_data

    version = "0.8"
    console.log("[SCRIPT VERSION] Hide_images version:" + version + "")

    var check_variant_number = true
    var check_product_name = true+4

    // Convert text to JSON object
    // json_obj = JSON.parse(data)
    console.log("[get_data] text_data:")
    console.log(data)

    // Собираем все данные в один json объект
    products_array = data
    //products_array = []
    //data.forEach(function callback(v, k) {
    //    items_products = v["products"]
    //    products_array = products_array.concat(items_products)
    //});
    console.log("[get_data] products_array:")
    console.log(products_array)

    // Удаляем дубликаты
    uniq_products_array = []
    seen_uid = []
    products_array.forEach(function callback(v, k) {
        uid = v["uid"]
        if (!seen_uid.includes(uid)){
            seen_uid.push(uid)
            uniq_products_array = uniq_products_array.concat(v)
        }
    });
    console.log("[get_data] uniq_products_array:")
    console.log(uniq_products_array)

    // Находим вариации без картинок
    products_blacklist = []
    uniq_products_array.forEach(function callback(v, k) {
        editions_blacklist = []

        // Общие значениея
        product_name = v["title"]
        debug_mode = false
        // Включаем дебаг для конкретного примера
        if (product_name == "Любой Тайтл для дебага"){
            debug_mode = true
        }
        product_uid = v["uid"]
        // Находим название первой картинки в галлерее
        gallery = v["gallery"]
        gallery = gallery.split(",")[0]
        gallery = gallery.split("\/").slice(-1)[0]
        gallerys_first_image_name = gallery.replace('"}', "")
        // Находим массив со всеми вариациями
        editions = v["editions"]
        // Убираем дубликаты цвета (Иначе возникает баг с вариациями у которых есть разные размеры)
        uniq_editions = []
        seen_uid = []
        editions.forEach(function callback(v, k) {
            uid = v["Цвет"]
            if (!seen_uid.includes(uid)){
                seen_uid.push(uid)
                uniq_editions = uniq_editions.concat(v)
            }
        });

        // Смотрим сколько вариаций ссылается на первое изображение
        same_image_counter = 0

        if (debug_mode){
            console.log("gallerys_first_image_name :" + gallerys_first_image_name)
            console.log("[get_data] editions:")
            console.log(editions)
            console.log("[get_data] uniq_editions:")
            console.log(uniq_editions)
        }
        uniq_editions.forEach(function callback(e_v, e_k){
            // Достаем название изображения в нужном формате
            editions_image = e_v["img"]
            editions_image_name = editions_image.split("/").slice(-1)[0]
            // Достаем цвет
            editions_color = e_v["Цвет"]


            // Смотрим ссылается ли данная вариация на первое изображение в галлерее
            if (gallerys_first_image_name == editions_image_name){
                same_image_counter = same_image_counter + 1
                if (debug_mode){
                    console.log("same_image_counter :" + same_image_counter + "(" + editions_color + ")")
                    console.log(gallerys_first_image_name + " = " + "editions_image_name")
                }

                // Если это второе или более изображение которое ссылается на первое изображение то вносим его в черный список
                if (same_image_counter > 1){
                    editions_blacklist.push(editions_color)
                }
            }

        });

        if (same_image_counter > 1){
            products_blacklist.push([product_name, editions_blacklist])
        }
    });
    console.log("[get_data] products_blacklist:")
    console.log(products_blacklist)

    // Скрываем ненужные вариации
    editions_to_hide = hide_editions(products_blacklist)

    // Find current product name
    current_product_name = $('.js-store-prod-name.t-name_xl').first().text()
    if (current_product_name == ""){
        check_product_name = false
    }
    console.log("[get_data] Current product obj:" + $('.js-store-prod-name'))

    // Цвет вариации, и какой номер изображения ему соответсвует
    var colors_and_image_n = []
    colors_and_image_n.push(["first", 0])
    // Select right data from JSON by current product name
    tilda_products = data["products"]

    console.log("[get_data] tilda_products:")
    console.log(tilda_products)

    console.log("[get_data] Ищем продукт:" + current_product_name)
    // Перебераем данные чтобы понять какие изображения к чему пренадлежат
    uniq_products_array.forEach(function(item, i, tilda_products){
        // console.log("Текущий перебираем продукт: " + item["title"])
        // Check if this right product
        if(item["title"] == current_product_name){
            // console.log("^^^ Совпадение найдено ^^^")

            // all variation of product
            variations = item["editions"]

            // make list of variations and N of image
            variations.forEach(function(v_item, v_i, variations){
                color = v_item["Цвет"]
                image = v_item["img"]

                str_to_search = "div[data-original='" + image + "']"
                number =  $(".t-slds__thumbsbullet-wrapper").find(str_to_search).first().parent().attr("data-slide-bullet-for");

                // Пишем какой номер изображения у текущего цвета
                colors_and_image_n.push([color, Number(number)])

                // Если номер некорректный то дебаг
                if (number == NaN || number == -1 || isNaN(number) || isNaN(Number(number))){
                    check_variant_number = false
                    console.log("[get_data] Number is INCORRECT. Detailed data:")
                    console.log(color)
                    console.log(image)
                    console.log(str_to_search)
                    console.log(number)
                }
            })
        }
    });

    // Вбиваем последний элемент в массив
    all_images_count = $(".t-slds__thumbsbullet.t-slds__bullet").length
    colors_and_image_n.push(["last", all_images_count + 1])
    console.log("[get_data] Таблица цветов и их порядкового номера:")
    console.log(colors_and_image_n)

    // Повторяющийся блок
    if (check_variant_number && check_product_name) {
        console.log("[get_data] Launch : hide_images()")
        console.log(check_variant_number)
        console.log(check_product_name)
        hide_images(colors_and_image_n, all_images_count, editions_to_hide)
    } else {
        console.log("[get_data] There is no need data. Launch : get_data()")
        get_data()
    }
}

// var url = 'https://store.tildacdn.com/api/getproductslist/?storepartuid=500919254671';
var url = 'https://functions.yandexcloud.net/d4eq1ik86e0cq76k9p6c'
json_data = ""
// Определяем вводные данные
$.get( url, function( json_data ) {
    console.log("[get_data] json_data:")
    console.log(json_data)
    $(document).ready(function(){
        get_data(json_data)
        // ONLY FOR TEST ---
        $(".t-product__option-item").click(function() {
            console.log("Clicked")
            $(".t-product__option-item_active").first().removeClass("t-product__option-item_active")
            $(this).addClass("t-product__option-item_active")
            // hide_images(colors_and_image_n, all_images_count, url_data_was_recived);
        });
        // ONLY FOR TEST ^^^
    });
});
