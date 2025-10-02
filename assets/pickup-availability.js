// @ts-nocheck
import { DialogComponent } from '@theme/dialog';

/**
 * Pickup Availability Drawer
 * - Displays store pickup availability for selected variant
 * - Accessible + customizable
 */
class PickupAvailabilityComponent extends DialogComponent {
  connectedCallback() {
    super.connectedCallback?.();

    this.variantId = this.dataset.variantId;
    this.contentContainer = this.querySelector('.pickup-availability-content');
    this.variantSelector = this.querySelector('#drawerVariantSelector');

    const dataEl = document.getElementById('pickup-data');
    this.pickupData = dataEl ? JSON.parse(dataEl.textContent) : { variants: {} };

    if (this.variantId) {
      this.renderStores(this.variantId);
    }

    // listen for PDP variant updates
    document.addEventListener('variant:update', (event) => {
      const newVariant = event.detail?.variant;
      if (!newVariant?.id) return;

      if (this.variantSelector) {
        this.variantSelector.value = newVariant.id;
      }

      this.updateVariant(newVariant.id);
    });

    // listen for changes in the drawer selector
    this.variantSelector?.addEventListener('change', (e) => {
      const newVariantId = e.target.value;
      this.updateVariant(newVariantId);

      document.dispatchEvent(
        new CustomEvent('pickup:variantSelected', {
          detail: { id: newVariantId },
        })
      );
    });
  }

  /**
   * Updates the variant and re-renders the stores.
   * @param {string} variantId
   */
  updateVariant(variantId) {
    if (!variantId) return;
    this.variantId = variantId;
    this.updateDrawerSelect(variantId);
    this.renderStores(variantId);
  }

  /**
   * Updates drawer select value.
   * @param {string} variantId
   */
  updateDrawerSelect(variantId) {
    if (this.variantSelector) {
      this.variantSelector.value = variantId;
    }
  }

  /**
   * Renders the stores for the given variant ID.
   * @param {string} variantId
   */
  renderStores(variantId) {
    const variant = this.pickupData.variants[variantId];

    if (!variant) {
      this.contentContainer.innerHTML = `<p>No data available for this variant.</p>`;
      return;
    }

    if (!variant.stores.length) {
      this.contentContainer.innerHTML = `<p>No pickup locations available for this variant.</p>`;
      return;
    }

    const list = variant.stores.map(this.storeToListItem).join('');
    this.contentContainer.innerHTML = `
      <ul class="pickup-availability__list" role="list">${list}</ul>
    `;
  }

  /**
   * Render a single store item
   */
  storeToListItem(store) {
    const availableText = store.available
      ? store.pick_up_time
      : 'Unavailable';

    const iconTemplate = document.querySelector('#pickup-icon-template')?.innerHTML || '';

    return `
      <li class="pickup-availability__item" role="listitem">
        <span class="pickup-availability__status-icon ${store.available ? 'pickup-availability__status--available' : 'pickup-availability__status--unavailable'}" aria-label="${store.available ? 'Available' : 'Unavailable'}">
            ${iconTemplate}
        </span>
        <div class="pickup-availability__info">
          <strong class="pickup-availability__name">${store.location.name}</strong><br>
          <span class="pickup-availability__address">${store.location.address1}, ${store.location.city}, ${store.location.country}</span><br>
          ${
            store.location.phone
              ? `<a href="tel:${store.location.phone}" class="pickup-availability__phone">${store.location.phone}</a><br>`
              : ''
          }
          <p class="pickup-availability__time" aria-live="polite">${availableText}</p>
        </div>
      </li>
    `;
  }

  open() {
    this.showDialog();
    this.focusFirstHeading();
  }

  close() {
    this.closeDialog();
  }

  /**
   * Move focus into drawer for accessibility
   */
  focusFirstHeading() {
    const heading = this.querySelector('h2,h3,h4');
    heading?.focus();
  }
}

if (!customElements.get('pickup-availability-component')) {
  customElements.define('pickup-availability-component', PickupAvailabilityComponent);
}
