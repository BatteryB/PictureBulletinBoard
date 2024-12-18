$(document).ready(function () {
    const $palette = $('#1')[0];
    const paletteContext = $palette.getContext('2d');
    paletteContext.lineCap = 'round';
    paletteContext.lineJoin = 'round';
    paletteContext.lineWidth = 5;

    let ctxArr = [{
        canvasId: 1,
        canvas: $palette,
        ctx: paletteContext
    }]
    let correntCanvas = ctxArr[0];

    const $preview = $('#preview')[0];
    const previewContext = $preview.getContext('2d');
    previewContext.lineCap = 'round';
    previewContext.lineJoin = 'round';
    previewContext.lineWidth = 5;

    let drawing = false;
    let shapes = "자유";
    let startX, startY, currentX, currentY;

    let drawLog = [];
    let logIndex = -1;

    // ======================
    // =======function=======
    // ======================

    function startDrawing(x, y) {
        drawing = true;
        correntCanvas.ctx.beginPath();
        correntCanvas.ctx.moveTo(x, y);
        startX = x;
        startY = y;
    }

    function draw(x, y) {
        if (shapes == "자유" || shapes == "지우개") {
            correntCanvas.ctx.globalCompositeOperation = shapes == "지우개" ? "destination-out" : "source-over";
            correntCanvas.ctx.lineTo(x, y);
            correntCanvas.ctx.stroke();
        }
    }

    function previewLine(x, y) {
        currentX = x;
        currentY = y;
        redraw();
        previewContext.beginPath();
        previewContext.moveTo(startX, startY);
        previewContext.lineTo(currentX, currentY);
        previewContext.stroke();
    }

    function previewRec(x, y) {
        currentX = x;
        currentY = y;
        redraw();
        const width = currentX - startX;
        const height = currentY - startY;
        previewContext.strokeRect(startX, startY, width, height);
    }

    function previewCircle(x, y) {
        currentX = x;
        currentY = y;
        redraw();
        const width = currentX - startX;
        const height = currentY - startY;
        previewContext.beginPath();
        previewContext.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
        previewContext.stroke();
    }

    function stopDrawing() {
        if (shapes == "직선") {
            correntCanvas.ctx.beginPath();
            correntCanvas.ctx.moveTo(startX, startY);
            correntCanvas.ctx.lineTo(currentX, currentY);
            correntCanvas.ctx.stroke();
        } else if (shapes == "사각형") {
            const width = currentX - startX;
            const height = currentY - startY;
            correntCanvas.ctx.strokeRect(startX, startY, width, height);
        } else if (shapes == "원") {
            const width = currentX - startX;
            const height = currentY - startY;
            correntCanvas.ctx.beginPath();
            correntCanvas.ctx.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
            correntCanvas.ctx.stroke();
        }
        drawing = false;
        redraw();

        // if (logIndex < drawLog.length - 1) {
        //     drawLog = drawLog.slice(0, logIndex + 1);
        // }

        // // drawLog.push({ // 기능 버림
        // //     art: correntCanvas.toDataURL(), 
        // //     layer: correntCanvas
        // // }); // 뒤로가기, 앞으로가기
        // logIndex++;
    }

    // function loadImg(drawData) {
    //     const img = new Image();
    //     img.src = drawData.art;
    //     img.onload = function () {
    //         drawData.layer.ctx.clearRect(0, 0, drawData.layer.width, drawData.layer.height);
    //         drawData.layer.ctx.drawImage(img, 0, 0, drawData.layer.width / 2, drawData.layer.height / 2); // 반으로 줄여서 그림
    //     };
    // }

    function redraw() {
        previewContext.clearRect(0, 0, $palette.width, $palette.height);
    }

    function swapCanvasZIndex($canvas1, $canvas2) {
        const zIndex1 = $canvas1.css('z-index');
        const zIndex2 = $canvas2.css('z-index');
        $canvas1.css('z-index', zIndex2);
        $canvas2.css('z-index', zIndex1);
    }

    function getLayerAndCanvas($element) {
        const $layer = $element.closest('.layer');
        const canvasId = $layer.find('.canvasId').val();
        const $canvas = $(`#${canvasId}`);
        return { $layer, $canvas };
    }

    // ======================
    // =========code=========
    // ======================

    $('#preview').on('mousedown touchstart', function (e) {
        const offset = $(e.currentTarget).offset();
        const x = e.type === 'mousedown' ? e.clientX - offset.left : e.touches[0].clientX - offset.left;
        const y = e.type === 'mousedown' ? e.clientY - offset.top : e.touches[0].clientY - offset.top;

        if (shapes == "텍스트") {
            const text = prompt('글 입력');
            if (text == null) return;
            const fontSize = $('#lineWidth').val() * 4;
            correntCanvas.ctx.font = `${fontSize}px gothic`;

            const textMetrics = correntCanvas.ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = fontSize;

            const fixX = x - textWidth / 2;
            const fixY = y + textHeight / 2;

            correntCanvas.ctx.fillText(text, fixX, fixY);
            return;
        }

        startDrawing(x, y);
        e.preventDefault();
    }).on('mousemove touchmove', function (e) {
        if (!drawing) return;

        const offset = $(e.currentTarget).offset();
        const x = e.type === 'mousemove' ? e.clientX - offset.left : e.touches[0].clientX - offset.left;
        const y = e.type === 'mousemove' ? e.clientY - offset.top : e.touches[0].clientY - offset.top;

        if (shapes == "자유" || shapes == "지우개") draw(x, y);
        else if (shapes == "직선") previewLine(x, y);
        else if (shapes == "사각형") previewRec(x, y);
        else if (shapes == "원") previewCircle(x, y);

        e.preventDefault();
    }).on('mouseup touchend touchcancel', stopDrawing);

    $('#color').on('input', function () {
        ctxArr.forEach(palette => {
            palette.ctx.strokeStyle = $(this).val();
        });

        previewContext.strokeStyle = $(this).val();
    });

    $('#lineWidth').on('input', function () {
        ctxArr.forEach(palette => {
            palette.ctx.lineWidth = $(this).val();
        });

        previewContext.lineWidth = $(this).val();
        $('#widthVal').text($(this).val());
    });

    $('input[name="shapes"]').on('change', function () {
        shapes = $('input[name="shapes"]:checked').val();
        correntCanvas.ctx.globalCompositeOperation = (shapes === "지우개") ? "destination-out" : "source-over";
    });

    // $('#back').on('click', () => {
    //     if (logIndex > 0) {
    //         logIndex--;
    //         loadImg(drawLog[logIndex]);
    //     }
    // })

    // $('#forward').on('click', () => {
    //     if (logIndex < drawLog.length - 1) {
    //         logIndex++;
    //         loadImg(drawLog[logIndex]);
    //     }
    // })

    const $layerList = $('#layerList');
    let layerCnt = 1;
    $('#addLayer').on('click', () => {
        const $layer = $('#wire').clone();
        $layer.find('.layerName').text(`레이어 ${++layerCnt}`);
        $layer.find('.canvasId').val(layerCnt);
        $layer.removeAttr('id');
        $layerList.append($layer);

        $('#canvasList').append(`<canvas class="palette" id="${layerCnt}"></canvas>`);
        const $newCanvas = $(`#${layerCnt}`)[0];

        $newCanvas.width = (window.innerWidth - 200) * 2;
        $newCanvas.height = (window.innerHeight - 100) * 2;
        $newCanvas.style.width = (window.innerWidth - 200) + 'px';
        $newCanvas.style.height = (window.innerHeight - 100) + 'px';

        const newCanvasCtx = $newCanvas.getContext('2d');
        newCanvasCtx.scale(2, 2);
        newCanvasCtx.lineCap = 'round';
        newCanvasCtx.lineJoin = 'round';
        newCanvasCtx.lineWidth = 5;

        ctxArr.push({
            canvasId: layerCnt,
            canvas: $newCanvas,
            ctx: newCanvasCtx
        });

        for (let i = 0; i < ctxArr.length; i++) {
            $(ctxArr[i].canvas).css("z-index", ctxArr.length - i);
        }
    });

    $("#layerList").on('click', '.layerRemove', function () {
        const { $layer, $canvas } = getLayerAndCanvas($(this));
        $layer.remove();
        $canvas.remove();
    }).on('click', '.layerUp', function () {
        const { $layer, $canvas } = getLayerAndCanvas($(this));
        const $prevLayer = $layer.prev();

        if ($prevLayer.length > 0) {
            const prevCanvasId = $prevLayer.find('.canvasId').val();
            const $prevCanvas = $(`#${prevCanvasId}`);
            swapCanvasZIndex($canvas, $prevCanvas);
            $layer.insertBefore($prevLayer);
        }
    }).on('click', '.layerdown', function () {
        const { $layer, $canvas } = getLayerAndCanvas($(this));
        const $nextLayer = $layer.next();

        if ($nextLayer.length > 0) {
            const nextCanvasId = $nextLayer.find('.canvasId').val();
            const $nextCanvas = $(`#${nextCanvasId}`);
            swapCanvasZIndex($canvas, $nextCanvas);
            $layer.insertAfter($nextLayer);
        }
    }).on('click', '.layer', function () {
        correntCanvas = ctxArr.find(canvas => canvas.canvasId == $(this).find('.canvasId ').val());
    });

    // ======================
    // =========ajax=========
    // ======================

    function removeBlocker() {
        setTimeout(() => {
            $('#sendTxt').text('이메일 전송중...');
            $('#blocker').removeClass('spin');
        }, 2500);
    }

    async function getTempCanvas() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = (window.innerWidth - 200) * 2;
        tempCanvas.height = (window.innerHeight - 100) * 2;
        tempCanvas.style.width = (window.innerWidth - 200) + 'px';
        tempCanvas.style.height = (window.innerHeight - 100) + 'px';
        const tempContext = tempCanvas.getContext('2d');
        tempContext.fillStyle = 'white';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        const imgDataArr = []
        $('#layerList .layer').each(function () {
            // const canvasImg = $(`#${$(this).find('.canvasId').val()}`);
            const canvasImg = ctxArr.find(canvas => canvas.canvasId == $(this).find('.canvasId').val());
            const dataURL = canvasImg.canvas.toDataURL('image/png');
            imgDataArr.push(dataURL)
        })
        imgDataArr.reverse();
        for (const imgData of imgDataArr) {
            const img = await loadImage(imgData);
            tempContext.drawImage(img, 0, 0);
        }

        return tempCanvas;
    }

    function loadImage(imageData) {
        return new Promise(function (res, rej) {
            const img = new Image();
            img.src = imageData;
            img.onload = function () {
                res(img)
            }
        })
    }

    // 캔버스 이미지저장 => 이메일 전송
    $('#sendEmail').off('click').on('click', async () => {
        const receptionEmail = $('#receptionEmail').val();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (receptionEmail === "") {
            alert("이메일 주소를 입력해주세요.\n예) example@address.com");
            return;
        }

        if (!emailRegex.test(receptionEmail)) {
            alert("올바른 이메일 형식을 입력해주세요.\n예) example@address.com");
            return;
        }

        $('#blocker').addClass('spin');
        const tampCanvas = await getTempCanvas();
        const dataURL = tampCanvas.toDataURL('image/png');
        const img = new Image();
        img.src = dataURL;

        $.ajax({
            type: "POST",
            url: "http://localhost:3000/saveImage",
            data: JSON.stringify({ image: dataURL }),
            contentType: "application/json",
            success: function (response) {
                console.log('save Completed');
            },
            error: function (error) {
                console.error("Error:", error);
            }
        });

        $.ajax({
            type: "POST",
            url: "http://localhost:3000/sendEmail",
            data: JSON.stringify({ email: receptionEmail }),
            contentType: "application/json",
            success: function (response) {
                $('#sendTxt').html('그림을 메일로 전송하였습니다.<br>메일을 확인해주세요');
                removeBlocker();
                $('#postName').val("");
            },
            error: function (error) {
                console.error(error)
                $('#sendTxt').html('메일 전송에 실패하였습니다.');
                removeBlocker();
                $('#receptionEmail').val("");
            }
        });
    });


    $('#postImg').on('click', async () => {
        const postName = $('#postName').val();

        if (postName == '') {
            alert("그림의 이름을 적어주세요.");
            return;
        }

        $('#sendTxt').text('그림 게시중...');
        $('#blocker').addClass('spin');

        const tampCanvas = await getTempCanvas();
        const dataURL = tampCanvas.toDataURL('image/png');
        const img = new Image();
        img.src = dataURL;

        $.ajax({
            type: "post",
            url: "http://localhost:3000/postImage",
            data: JSON.stringify({ image: dataURL, postName: postName }),
            contentType: "application/json",
            success: function (response) {
                $('#sendTxt').text('그림이 게시되었습니다.');
                removeBlocker();
            },
            error: function (error) {
                $('#sendTxt').text('그림 게시에 실패했습니다.');
                removeBlocker();
            }
        });
    })
});
