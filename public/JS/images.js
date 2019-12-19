function image(from, base64Image, uuid) {
    let w = (lines.clientWidth | 0) - 20;
    //lines.innerHTML += '<p><b>' + from + '</b>' + '<img background-image src="' + base64Image + '" width="'+ w +'"/>' + '</p>';
    let h = (lines.clientHeight | 0) - 20;
    if (w < h)
        dm(from, '<img background-image src="' + base64Image + '" width="' + w + '"/>', uuid, false)
    else
        dm(from, '<img background-image src="' + base64Image + '" height="' + h + '"/>', uuid, false)
    //setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER);
}

// Created by STRd6
// MIT License
// jquery.paste_image_reader.js
function paste_image_reader($) {
    var defaults;
    $.event.fix = (function (originalFix) {
        return function (event) {
            event = originalFix.apply(this, arguments);
            if (event.type.indexOf("copy") === 0 || event.type.indexOf("paste") === 0) {
                event.clipboardData = event.originalEvent.clipboardData;
            }
            return event;
        };
    })($.event.fix);
    defaults = {
        callback: $.noop,
        matchType: /image.*/
    };
    return ($.fn.pasteImageReader = function (options) {
        if (typeof options === "function") {
            options = {
                callback: options
            };
        }
        options = $.extend({}, defaults, options);
        return this.each(function () {
            var $this, element;
            element = this;
            $this = $(this);
            return $this.bind("paste", function (event) {
                var clipboardData, found;
                found = false;
                clipboardData = event.clipboardData;
                return Array.prototype.forEach.call(clipboardData.types, function (type, i) {
                    var file, reader;
                    if (found) {
                        return;
                    }
                    if (
                        type.match(options.matchType) ||
                        clipboardData.items[i].type.match(options.matchType)
                    ) {
                        file = clipboardData.items[i].getAsFile();
                        reader = new FileReader();
                        reader.onload = function (evt) {
                            return options.callback.call(element, {
                                dataURL: evt.target.result,
                                event: evt,
                                file: file,
                                name: file.name
                            });
                        };
                        reader.readAsDataURL(file);
                        return (found = true);
                    }
                });
            });
        });
    });
};

function initImage() {
    $('#imagefile').bind('change', function (e) {
        reduceFileSize(this.files[0], 600, Infinity, 0.9, blob => {
            let uuid = generateUUID();
            image('me', blob, uuid);
            socket.emit('dmImage', { user: dmName, msg: blob, uuid: uuid });
        });
    });
    //var dataURL, filename;
    $("#message").pasteImageReader(function (results) {
        //filename = results.filename, dataURL = results.dataURL;
        const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);

                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, { type: contentType });
            return blob;
        }
        let file = b64toBlob(results.dataURL.slice(22), results.dataURL.slice(5, results.dataURL.indexOf(";")));
        reduceFileSize(file, 600, Infinity, 0.9, (blob, canvas) => {
            let uuid = generateUUID();
            image('me', blob, uuid);
            socket.emit('dmImage', { user: dmName, msg: blob, uuid: uuid });
        });
    });
}

// From https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob, needed for Safari:
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {

            var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                len = binStr.length,
                arr = new Uint8Array(len);

            for (var i = 0; i < len; i++) {
                arr[i] = binStr.charCodeAt(i);
            }

            callback(new Blob([arr], { type: type || 'image/png' }));
        }
    });
}

window.URL = window.URL || window.webkitURL;

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// -2 = not jpeg, -1 = no data, 1..8 = orientations
function getExifOrientation(file, callback) {
    // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
    if (file.slice) {
        file = file.slice(0, 131072);
    } else if (file.webkitSlice) {
        file = file.webkitSlice(0, 131072);
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        var view = new DataView(e.target.result);
        if (view.getUint16(0, false) != 0xFFD8) {
            callback(-2);
            return;
        }
        var length = view.byteLength, offset = 2;
        while (offset < length) {
            var marker = view.getUint16(offset, false);
            offset += 2;
            if (marker == 0xFFE1) {
                if (view.getUint32(offset += 2, false) != 0x45786966) {
                    callback(-1);
                    return;
                }
                var little = view.getUint16(offset += 6, false) == 0x4949;
                offset += view.getUint32(offset + 4, little);
                var tags = view.getUint16(offset, little);
                offset += 2;
                for (var i = 0; i < tags; i++)
                    if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                        callback(view.getUint16(offset + (i * 12) + 8, little));
                        return;
                    }
            }
            else if ((marker & 0xFF00) != 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        callback(-1);
    };
    reader.readAsArrayBuffer(file);
}

// Derived from https://stackoverflow.com/a/40867559, cc by-sa
function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
    var canvas = document.createElement('canvas');
    if (orientation > 4) {
        canvas.width = rawHeight;
        canvas.height = rawWidth;
    } else {
        canvas.width = rawWidth;
        canvas.height = rawHeight;
    }

    if (orientation > 1) {
        console.log("EXIF orientation = " + orientation + ", rotating picture");
    }

    var ctx = canvas.getContext('2d');
    switch (orientation) {
        case 2: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
    }
    ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
    return canvas;
}

function reduceFileSize(file, maxWidth, maxHeight, quality, callback) {
    /*if (file.size <= acceptFileSize) {
        callback(file);
        return;
    }*/
    var img = new Image();
    img.onerror = function () {
        URL.revokeObjectURL(this.src);
        callback(file);
    };
    img.onload = function () {
        URL.revokeObjectURL(this.src);
        getExifOrientation(file, function (orientation) {
            var w = img.width, h = img.height;
            var scale = (orientation > 4 ?
                Math.min(maxHeight / w, maxWidth / h, 1) :
                Math.min(maxWidth / w, maxHeight / h, 1));
            h = Math.round(h * scale);
            w = Math.round(w * scale);

            var canvas = imgToCanvasWithOrientation(img, w, h, orientation);
            var blob = canvas.toDataURL("image/jpeg", 0.7);
            callback(blob, canvas);
            /*canvas.toBlob(function(blob) {
                console.log("Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB");
                callback(blob);
            }, 'image/jpeg', quality);*/
        });
    };
    img.src = URL.createObjectURL(file);
}
