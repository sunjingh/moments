import type {ResultVO, SysConfigVO} from "~/types";
import {toast} from "vue-sonner";
import {useGlobalState} from "~/store";
import markdownit from "markdown-it";
import {fromHighlighter} from '@shikijs/markdown-it/core'
import {createHighlighterCore} from 'shiki/core'
import exp from "node:constants";


const global = useGlobalState()

export async function useMyFetch<T>(url: string, data?: any) {
    const userinfo = global.value.userinfo
    const headers: Record<string, any> = {}
    if (userinfo.token) {
        headers["x-api-token"] = userinfo.token
    }
    try {
        const res = await $fetch<ResultVO<T>>(`/api${url}`, {
            method: "post",
            body: data ? JSON.stringify(data) : null,
            headers: headers
        })
        if (res.code !== 0) {
            if (res.code === 3 || res.code === 4) {
                global.value.userinfo = {}
                window.location.href = '/'
                throw new Error(res.message)
            }
            toast.error(res.message || "请求失败")
            throw new Error(res.message)
        }
        return res.data
    } finally {

    }
}

async function upload2S3(files: FileList, onProgress: Function | undefined) {
    const result = []
    for (let i = 0; i < files.length; i++) {
        const {preSignedUrl, imageUrl, thumbnailPreSignedUrl, thumbnailImageUrl} = await useMyFetch<{
            preSignedUrl: string,
            imageUrl: string,
            thumbnailPreSignedUrl: string,
            thumbnailImageUrl: string,
        }>('/file/s3PreSigned', {
            contentType: files[0].type
        })
        await upload2S3WithProgress(preSignedUrl, files[i], (name: string, progress: number) => {
            onProgress && onProgress(files.length, i + 1, name, progress)
        })
        try {
            const thumbnailFile = await createThumbnail(files[i])
            upload2S3WithProgress(thumbnailPreSignedUrl, thumbnailFile, () => {
            }).then(() => {
            })
        } catch (e) {
            console.log('✨✨✨index.ts:60 e===>', e)
        }
        result.push(imageUrl)
    }
    return result
}

const upload2S3WithProgress = async (preSignedUrl: string, file: File, onProgress: Function) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', e => onProgress(file.name, e.loaded / e.total));
        xhr.addEventListener('load', () => {
            if (xhr.responseType === 'json') {
                resolve(JSON.parse(xhr.responseText))
            }
            if (xhr.status === 200) {
                resolve(null);
            }
        });

        xhr.addEventListener('error', () => reject(new Error('File upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('File upload aborted')));
        xhr.open('PUT', preSignedUrl, true);
        //@ts-ignore
        // xhr.setRequestHeader('Content-Type', null);
        xhr.send(file);
    })
}


export async function useUpload(files: FileList | null, onProgress: Function | undefined = undefined) {
    const sysConfig = useState<SysConfigVO>('sysConfig')
    const result = []
    if (!files || files.length === 0) {
        toast.error("没有选择文件")
        return
    }

    const userinfo = global.value.userinfo
    const headers: Record<string, any> = {}
    if (userinfo.token) {
        headers["x-api-token"] = userinfo.token
    }

    if (sysConfig.value.enableS3) {
        return await upload2S3(files, onProgress)
    }
    for (let i = 0; i < files.length; i++) {
        try {
            const res = await uploadFiles('/api/file/upload', files[i], (name: string, progress: number) => {
                onProgress && onProgress(files.length, i + 1, name, progress)
            }) as {
                code: number,
                data: string[],
                message: string
            }
            if (res.code !== 0) {
                toast.error(res.message || "请求失败")
                throw new Error(res.message)
            }
            result.push(...res.data)
        } catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message)
            }
            throw new Error("接口异常")
        }
    }
    return result
}


export const uploadFiles = (url: string, file: File, onProgress: Function) =>
    new Promise((resolve, reject) => {
        const userinfo = global.value.userinfo
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', e => onProgress(file.name, e.loaded / e.total));
        xhr.addEventListener('load', () => resolve(JSON.parse(xhr.responseText)));
        xhr.addEventListener('error', () => reject(new Error('File upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('File upload aborted')));
        xhr.open('POST', url, true);
        if (userinfo.token) {
            xhr.setRequestHeader('x-api-token', userinfo.token);
        }
        const formData = new FormData();
        formData.append("files", file)
        xhr.send(formData);
    });


export const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
})

createHighlighterCore({
    themes: [
        import('shiki/themes/github-dark.mjs')
    ],
    langs: [
        import('shiki/langs/c.mjs'),
        import('shiki/langs/css.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/json.mjs'),
        import('shiki/langs/python.mjs'),
        import('shiki/langs/shellscript.mjs'),
        import('shiki/langs/sql.mjs'),
        import('shiki/langs/tsx.mjs'),
        import('shiki/langs/xml.mjs'),
        import('shiki/langs/yaml.mjs'),
        import('shiki/langs/go.mjs'),
    ],
    loadWasm: import('shiki/wasm')
}).then((highlighter) => {
    //@ts-ignore
    md.use(fromHighlighter(highlighter, {
        themes: {
            light: 'github-dark',
            dark: 'github-dark',
        }
    }))
})

export const THUMBNAIL_SCALE = 2

export function createThumbnail(file: File) {
    return new Promise<File>((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = function () {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const width = img.width / THUMBNAIL_SCALE;
            const height = img.height / THUMBNAIL_SCALE;

            // if (width > height) {
            //     if (width > maxWidth) {
            //         height *= maxWidth / width;
            //         width = maxWidth;
            //     }
            // } else {
            //     if (height > maxHeight) {
            //         width *= maxHeight / height;
            //         height = maxHeight;
            //     }
            // }

            canvas.width = width;
            canvas.height = height;

            ctx!.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                resolve(new File([blob!], file.name, {type: 'image/jpeg'}));  // Return thumbnail image as a Blob object
            }, "image/jpeg", 0.7);

            URL.revokeObjectURL(objectUrl);
        };
        img.onerror = reject;
        img.src = objectUrl;
    });
}

export function uGetThumbnailImgPath(imgPath: string, thumbnailSuffix: string) {
    return imgPath.replace(/(\.[^.]+)$/, `$1${thumbnailSuffix}`)
}

export function sendGotifyMessage(params: { title: string; message: string }) {
    $fetch('https://gotify.tianjunli.top:666/message?token=AehGzbiIoB42mCz', {
        method: 'POST',
        body: {
            title: params.title,
            message: params.message,
            extras: {
                "client::display": {
                    contentType: "text/markdown"
                }
            }
        }
    }).then(() => {
        console.log('发送成功')
    }).catch(() => {
        console.log('发送失败')
    })
}