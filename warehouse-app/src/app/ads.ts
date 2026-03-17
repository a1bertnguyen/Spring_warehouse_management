import { Component, OnDestroy, OnInit } from "@angular/core";

@Component({
    selector: 'ads-display',
    template:`
    <div class="ads-container">
        <img [src]="poster[currentIndex]"
        class="ads-poster"
        (click)="nextPoster()"/>
    </div>
    `,
    styles: `
    .ads-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f9fafb;
        overflow: hidden;
        position: relative;
    }
    .ads-poster {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
        transition: opacity 0.5s ease-in-out;
    }
    `
})

export class ads{
    poster:string[]=[
        'assets/ads/ad1.png',
        'assets/ads/ad2.png',
        'assets/ads/ad3.png',
        'assets/ads/ad4.png'
    ]

    currentIndex=0;
    private intervalId?: ReturnType<typeof setInterval>;

    ngOnInit(){
        this.intervalId=setInterval(()=>{
            this.nextPoster();
        }, 5000);
    }
    ngOnDestroy(){
        if(this.intervalId){
            clearInterval(this.intervalId)
        }
    }
    nextPoster(){
        this.currentIndex=(this.currentIndex+1)%this.poster.length;
    }
}