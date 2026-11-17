/** Touch users inspect a talent before a repeat tap can change its rank. */
export class TalentTapController {
  #previewed = null;

  shouldAdjust(id, touchMode) {
    if (!touchMode) {
      this.clear();
      return true;
    }
    const confirmed = this.#previewed === id;
    this.#previewed = id;
    return confirmed;
  }

  clear() {
    this.#previewed = null;
  }
}
