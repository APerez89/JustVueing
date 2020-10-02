Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    },
    cart: {
      type: Array,
    }
  },
  template: `
    <div class="product">

      <div class="product-image">
        <img v-bind:src="image" alt="">
      </div>

      <div class="product-info">
        <h2>{{ product }}</h2>
        <p>{{ description }}</p>
        <p>Shipping: {{ shipping }}</p>

        <product-details :details="details"></product-details>

        <div class="color-wrap">
          <div
            class="color"
            v-for="(variant, index) in variants"
            :key="variant.id"
            :style="{ backgroundColor: variant.color }"
            @mouseover="updateProduct(index)"
          >
          </div>
        </div>

        <div class="sizes-wrap">
          <span v-for="size in sizes" class="sizes">{{ size }}</span>
        </div>

        <button
          :class="[ inStock ? 'button' : 'buttonDisabled' ]"
          v-on:click="addToCart"
          :disabled="!inStock"
        >
          Add to Cart
        </button>

        <button
          :class="[ this.cart.length === 0 ? 'buttonDisabled' : 'rm-button' ]"
          v-on:click="removeFromCart"
          :disabled="this.cart.length === 0"
        >
          Remove from Cart
        </button>

      </div>

      <product-tabs :reviews="reviews"></product-tabs>

    </div>
  `,
  data() {
    return {
      product: "Socks",
      selectedVariant: 0,
      description: "A pair of warm, fuzzy socks",
      details: ["80% Cotton", "20% Polyester", "Gender-neutral"],
      sizes: ["S", "M", "L", "XL"],
      variants: [
        {
          id: "2234",
          color: "#34a16a",
          image: "./assets/vmSocks-green-onWhite.jpg",
          quantity: 8
        },
        {
          id: "2235",
          color: "#41576f",
          image: "./assets/vmSocks-blue-onWhite.jpg",
          quantity: 10
        }
      ],
      reviews: []
    }
  },
  methods: {
    addToCart() {
      this.$emit('add-to-cart', this.variants[this.selectedVariant].id)
    },
    removeFromCart() {
      this.$emit('rm-from-cart', this.variants[this.selectedVariant].id)
    },
    updateProduct(index) {
      this.selectedVariant = index;
    }
  },
  computed: {
    image() {
      return this.variants[this.selectedVariant].image;
    },
    inStock() {
      return this.variants[this.selectedVariant].quantity
    },
    shipping() {
      if (this.premium) {
        return "Free!"
      }
      return "$2.99"
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview)
    })
  }
})

Vue.component('product-review', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">
      <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>

      <p>
        <label for="name">Name</label>
        <input id="name" v-model="name"></input>
      </p>

      <p>
        <label for="review">Review</label>
        <textarea name="review" v-model="review"></textarea>
      </p>

      <p>
        <label for="rating">Rating</label>
        <select id="rating" v-model.number="rating">
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </select>
      </p>

      <p>
        <input type="submit" value="Submit">
      </p>

    </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null,
        this.review = null,
        this.rating = null
        this.errors = []
      } else {
        if (!this.name) this.errors.push("Name is Required")
        if (!this.review) this.errors.push("A Review is Required")
        if (!this.rating) this.errors.push("A Rating is Required")
      }
    }
  }
})

Vue.component('product-details', {
  addToCart() {
    this.$emit('add-to-cart')
  },
  rmFromCart() {
    this.$emit('rm-from-cart')
  },
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: false
    }
  },
  template: `
    <div>
      <div>
        <span
          :class="{ tab, activeClass: selectedTab === tab}"
          v-for="(tab, index) in tabs"
          :key="index"
          @click="selectedTab = tab"
        >
          {{ tab }}
        </span>
      </div>

      <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews.</p>
        <ul>
          <li v-for="review in reviews">
            <p>{{ review.name }}</p>
            <p>{{ review.review }}</p>
            <p>Rating: {{ review.rating }}</p>
          </li>
        </ul>
      </div>

      <div v-show="selectedTab === 'Make a Review'">
        <product-review></product-review>
      </div>

    </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
})

var eventBus = new Vue()

var app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id)
    },
    rmFromCart(id) {
      for(var i = this.cart.length - 1; i >= 0; i--) {
        if(this.cart[i] === id) {
          this.cart.splice(i, 1);
        }
      }
    }
  }
})