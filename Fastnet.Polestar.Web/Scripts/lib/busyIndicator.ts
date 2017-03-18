/// <reference path="../package.d.ts" />
module fastnet {
    export class busyIndicator {
        private static isBlocked = false;
        private overlay: string =
        `<div class='block-overlay'>                        
            <div class='indicator'>
                <div class='message'></div>
                <div class='animation'><i class="fa fa-gear fa-spin fa-3x"></i></div>
            </div>
         </div>`;
        public block(message?: string) {
            if (!busyIndicator.isBlocked) {
                var overlayElement = document.createElement("div");
                overlayElement.innerHTML = this.overlay;
                document.body.appendChild(overlayElement);
                if(message !== undefined)  {
                    var nodes = overlayElement.getElementsByClassName("message");
                    nodes.item(0).innerHTML = message;
                }          
                busyIndicator.isBlocked = true;
            }
        }
        public unBlock() {
            var overlayParent = document.querySelector(".block-overlay").parentElement;
            overlayParent.parentElement.removeChild(overlayParent);
            busyIndicator.isBlocked = false;
        }
    }
}