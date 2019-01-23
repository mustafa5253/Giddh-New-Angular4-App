import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

const keyMaps = {
  backspace: 8,
  tab: 9,
  enter: 13,
  esc: 27,
  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
};
const controlKeyMaps = {
  shift: 'shiftKey',
  ctrl: 'ctrlKey',
  alt: 'altKey',
};

@Directive({
  selector: '[keyboardShortcut]'
})
export class KeyboardShortcutDirective {
  @Input() public keyboardShortcut: string | string[] | { [key: string]: boolean };
  @Output() public onShortcutPress = new EventEmitter<string>();

  constructor(private _el: ElementRef) {
  }

  @HostListener('window:keydown', ['$event, ElementRef'])
  public handleKeyDown(event: KeyboardEvent) {
    let key: string;
    if (Array.isArray(this.keyboardShortcut)) {
      this.matchArray(event, this.keyboardShortcut);
      return;
    } else if (typeof this.keyboardShortcut === 'string') {
      key = this.keyboardShortcut;
    } else {
      key = Object.keys(this.keyboardShortcut)[0];
      if (!this.keyboardShortcut[key]) {
        return;
      }
    }
    this.matchSingle(event, key);
  }

  private matchArray(event: KeyboardEvent, shortcuts: string[]) {
    for (let key of shortcuts) {
      this.matchSingle(event, key);
    }
  }

  private matchSingle(event: KeyboardEvent, key: string) {
    if (key.includes('+')) {
      let keys = key.split('+');
      const match = keys.every(k => (controlKeyMaps[k] && event[controlKeyMaps[k]]) || keyMaps[k] === event.which);
      console.log(key, event, match);
      if (match) {
        this.onMatch(key);
        return;
      }
    } else if (event.which === keyMaps[key] && !event.shiftKey && !event.ctrlKey && !event.altKey) {
      this.onMatch(key);
      return true;
    }
    return false;
  }

  private onMatch(key: string) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.onShortcutPress.emit(key);
  }
}
