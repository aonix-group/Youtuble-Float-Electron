import './index.css';
import { remote } from 'electron'

const mainWindow = remote.getCurrentWindow()

function setIframeSize(iframe: HTMLIFrameElement) {
  const { width, height } = mainWindow.getBounds()

  iframe.setAttribute('width', width.toString())
  iframe.setAttribute('height', height.toString())
}

try {
  const videoURL = Object.values(window.process.argv).find(item => item.search('aonix-youtube-float://') > -1)
  if (!videoURL) {
    throw new Error('URL do vídeo não iformada, use o aplicativo pela extensão do navegador.')
  }

  const regex = new RegExp('[/|=]([a-zA-Z0-9_-]{10,15})')
  const match = regex.exec(videoURL)
  const videoId = match[1]
  if (!videoId) {
    throw new Error('ID do vídeo não encontrado')
  }

  const url = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`

  const iframe = document.createElement('iframe')
  iframe.setAttribute('src', url)
  iframe.setAttribute('frameborder', '0')
  iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture')
  iframe.setAttribute('allowfullscreen', 'true')

  setIframeSize(iframe)
  mainWindow.on('resize', () => {
    setIframeSize(iframe)
  })

  document.body.appendChild(iframe)

  console.log({ url })
} catch (error) {
  alert(error.message)
  mainWindow.close()
}


let isAwaysOnTop = true
function handleAwaysOnTop() {
  isAwaysOnTop = !isAwaysOnTop
  mainWindow.setAlwaysOnTop(isAwaysOnTop)

  const icon = document.querySelector('.fa-thumbtack')
  if (icon) {
    if (!isAwaysOnTop) {
      icon.classList.add('rotate')
    } else {
      icon.classList.remove('rotate')
    }
  }
}

function closeApp() {
  console.log('Close app')
  mainWindow.close()
}

const pinButton: HTMLSpanElement = document.querySelector('.btn-pin')
const closeButton: HTMLSpanElement = document.querySelector('.btn-close')

if (pinButton) {
  pinButton.onclick = handleAwaysOnTop
}

if (closeButton) {
  closeButton.onclick = closeApp
}