import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgModule, OnChanges, OnDestroy, OnInit, Output, Renderer, SimpleChanges, ViewChild, } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IOption } from './sh-options.interface';

export interface ChangeEvent {
  start?: number;
  end?: number;
}

@Component({
  selector: 'virtual-scroll',
  template: `
    <div class="total-padding" [style.height]="scrollHeight + 'px'"></div>
    <div class="scrollable-content" #content [style.transform]="'translateY(' + topPadding + 'px)'">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      overflow: auto;
      overflow-y: auto;
      position: relative;
      -webkit-overflow-scrolling: touch;
    }

    .scrollable-content {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      position: absolute;
    }

    .total-padding {
      width: 1px;
      opacity: 0;
    }
  `]
})
export class VirtualScrollComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input()
  public items: IOption[] = [];

  @Input()
  public scrollbarWidth: number;

  @Input()
  public scrollbarHeight: number;

  @Input()
  public childWidth: number;

  @Input()
  public childHeight: number;

  @Output()
  public update: EventEmitter<any[]> = new EventEmitter<any[]>();

  @Output()
  public change: EventEmitter<ChangeEvent> = new EventEmitter<ChangeEvent>();

  @Output()
  public start: EventEmitter<ChangeEvent> = new EventEmitter<ChangeEvent>();

  @Output()
  public end: EventEmitter<ChangeEvent> = new EventEmitter<ChangeEvent>();

  @ViewChild('content', {read: ElementRef})
  public contentElementRef: ElementRef;

  public onScrollListener: any;
  public topPadding: number;
  public scrollHeight: number;
  public previousStart: number;
  public previousEnd: number;
  public startupLoop: boolean = true;

  constructor(private element: ElementRef, private renderer: Renderer) {
  }

  public ngOnInit() {
    this.onScrollListener = this.renderer.listen(this.element.nativeElement, 'scroll', this.refresh.bind(this));
    this.scrollbarWidth = 0; // this.element.nativeElement.offsetWidth - this.element.nativeElement.clientWidth;
    this.scrollbarHeight = 0; // this.element.nativeElement.offsetHeight - this.element.nativeElement.clientHeight;
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.previousStart = undefined;
    this.previousEnd = undefined;
    this.refresh();
  }

  public ngOnDestroy() {
    // Check that listener has been attached properly:
    // It may be undefined in some cases, e.g. if an exception is thrown, the component is
    // not initialized properly but destroy may be called anyways (e.g. in testing).
    if (this.onScrollListener !== undefined) {
      // this removes the listener
      this.onScrollListener();
    }
  }

  public ngAfterViewInit() {
    // debugger;
  }

  public refresh() {
    requestAnimationFrame(this.calculateItems.bind(this));
  }

  public scrollInto(item: any) {
    let index: number = (this.items || []).indexOf(item);
    if (index < 0 || index >= (this.items || []).length) {
      return;
    }

    let d = this.calculateDimensions();
    this.element.nativeElement.scrollTop = Math.floor(index / d.itemsPerRow) *
      d.childHeight - Math.max(0, (d.itemsPerCol - 1)) * d.childHeight;
    this.items.forEach(p => p.isHilighted = false);
    item.isHilighted = true;
    this.refresh();
  }

  public getHighlightedOption(): IOption {
    let index = this.items.findIndex(p => p.isHilighted);
    if (index > -1) {
      return this.items[index];
    }
    return null;
  }

  public getPreviousHilightledOption(): IOption {
    let index = this.items.findIndex(p => p.isHilighted);
    if (index > 0) {
      return this.items[index - 1];
    } else {
      return this.items[0];
    }
  }

  public getNextHilightledOption(): IOption {
    let index = this.items.findIndex(p => p.isHilighted);
    if (index < this.items.length) {
      return this.items[index + 1];
    } else {
      return this.items[0];
    }
  }

  private countItemsPerRow() {
    let offsetTop;
    let itemsPerRow;
    let children = this.contentElementRef.nativeElement.children;
    for (itemsPerRow = 0; itemsPerRow < children.length; itemsPerRow++) {
      if (offsetTop !== undefined && offsetTop !== children[itemsPerRow].offsetTop) {
        break;
      }
      offsetTop = children[itemsPerRow].offsetTop;
    }
    return itemsPerRow;
  }

  private calculateDimensions() {
    let el = this.element.nativeElement;
    let content = this.contentElementRef.nativeElement;

    let items = this.items || [];
    let itemCount = items.length;
    let viewWidth = el.clientWidth - this.scrollbarWidth;
    let viewHeight = el.clientHeight - this.scrollbarHeight;

    let contentDimensions;
    if (this.childWidth === undefined || this.childHeight === undefined) {
      contentDimensions = content.children[0] ? content.children[0].getBoundingClientRect() : {
        width: viewWidth,
        height: viewHeight
      };
    }
    let childWidth = this.childWidth || contentDimensions.width;
    let childHeight = this.childHeight || contentDimensions.height;

    let itemsPerRow = Math.max(1, this.countItemsPerRow());
    let itemsPerRowByCalc = Math.max(1, Math.floor(viewWidth / childWidth));
    let itemsPerCol = Math.max(1, Math.floor(viewHeight / childHeight));
    if (itemsPerCol === 1 && Math.floor(el.scrollTop / this.scrollHeight * itemCount) + itemsPerRowByCalc >= itemCount) {
      itemsPerRow = itemsPerRowByCalc;
    }

    return {
      itemCount,
      viewWidth,
      viewHeight,
      childWidth,
      childHeight,
      itemsPerRow,
      itemsPerCol,
      itemsPerRowByCalc
    };
  }

  private calculateItems() {
    let el = this.element.nativeElement;

    let d = this.calculateDimensions();
    let items = this.items || [];
    this.scrollHeight = d.childHeight * d.itemCount / d.itemsPerRow;
    if (this.element.nativeElement.scrollTop > this.scrollHeight) {
      this.element.nativeElement.scrollTop = this.scrollHeight;
    }

    let indexByScrollTop = el.scrollTop / this.scrollHeight * d.itemCount / d.itemsPerRow;
    let end = Math.min(d.itemCount, Math.ceil(indexByScrollTop) * d.itemsPerRow + d.itemsPerRow * (d.itemsPerCol + 1));

    let maxStartEnd = end;
    const modEnd = end % d.itemsPerRow;
    if (modEnd) {
      maxStartEnd = end + d.itemsPerRow - modEnd;
    }
    let maxStart = Math.max(0, maxStartEnd - d.itemsPerCol * d.itemsPerRow - d.itemsPerRow);
    let start = Math.min(maxStart, Math.floor(indexByScrollTop) * d.itemsPerRow);

    this.topPadding = d.childHeight * Math.ceil(start / d.itemsPerRow);
    if (start !== this.previousStart || end !== this.previousEnd) {

      // update the scroll list
      this.update.emit(items.slice(start, end));

      // emit 'start' event
      if (start !== this.previousStart && this.startupLoop === false) {
        this.start.emit({start, end});
      }

      // emit 'end' event
      if (end !== this.previousEnd && this.startupLoop === false) {
        this.end.emit({start, end});
      }

      this.previousStart = start;
      this.previousEnd = end;

      if (this.startupLoop === true) {
        this.refresh();
      } else {
        this.change.emit({start, end});
      }

    } else if (this.startupLoop === true) {
      this.startupLoop = false;
      this.refresh();
    }
  }
}

@NgModule({
  imports: [CommonModule],
  exports: [VirtualScrollComponent],
  declarations: [VirtualScrollComponent]
})
export class VirtualScrollModule {
}
