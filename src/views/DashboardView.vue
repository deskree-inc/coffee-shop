<template>
  <div class="dashboard-wrapper">
    <loading-spinner :text="preloader.text" :show="preloader.show"></loading-spinner>
    <button class="logout-button" @click="logout">
      <img src="@/assets/logout.svg" alt="logout">
    </button>
    <div class="my-products-nav">
      <button-primary text="New Product" @click="newProductModal"></button-primary>
    </div>
    <div class="my-products">
            <div class="product" v-for="product in vendorWebflowProduct" :key="product._id">
              <div class="product-image" :style="{'background-image': `url(${product.skus[0]['main-image'].url})`}"
                   v-if="product.skus[0].hasOwnProperty('main-image')">
              </div>
              <div class="product-info">
                <h2>{{ product.product.name }}</h2>
                <span>{{ product.product.description }}</span>
              </div>
            </div>
    </div>
    <div class="new-product" :style="{width: newProductMenu ? '25%' : 0}">
      <button class="close-button" @click="newProductMenu = false">
        <img src="@/assets/close.svg" alt="close">
      </button>
      <div class="form">
        <h1>New Product</h1>
        <input-field name="name" placeholder="Product name" type="text" v-model="newProduct.name"></input-field>
        <input-field name="description" placeholder="Description" type="text"
                     v-model="newProduct.description"></input-field>
        <input-field name="short-description" placeholder="Short Description" type="text"
                     v-model="newProduct.shortDescription"></input-field>
        <input-field name="price" placeholder="Price" type="number"
                     v-model="newProduct.price"></input-field>
        <dropdown-field name="category" v-model="newProduct.category"
                        :options="formattedCategories"></dropdown-field>
        <div class="grid-container">
          <input-field name="width" placeholder="Width" type="number"
                       v-model="newProduct.width"></input-field>
          <input-field name="length" placeholder="Length" type="number"
                       v-model="newProduct.length"></input-field>
          <input-field name="height" placeholder="Height" type="number"
                       v-model="newProduct.height"></input-field>
          <input-field name="weight" placeholder="Weight" type="number"
                       v-model="newProduct.weight"></input-field>

        </div>
        <label for="file" class="file-upload">
          Upload image
        </label>
        <span class="error" v-if="errors.length > 0">{{ errors[0].detail }}</span>
        <span class="file-name" v-if="fileName.length > 0">{{ fileName }}</span>
        <input type="file" id="file" ref="file" v-on:change="handleFileUpload" style="display: none"/>
        <button-primary text="Create Recipe" @click="createProduct"></button-primary>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import ButtonPrimary from "@/components/Button.vue";
import {client} from "@/server";
import {WebflowCollectionResponseInterface} from "@/interfaces/webflowCollection.interface";
import InputField from "@/components/InputField.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import DropdownField from "@/components/DropdownField.vue";

export default defineComponent({
  name: 'DashboardView',
  components: {DropdownField, ButtonPrimary, InputField, LoadingSpinner},
  data() {
    return {
      preloader: {
        text: "",
        show: false
      },
      products: [] as Array<Record<string, any>>,
      vendorProducts: [] as Array<Record<string, any>>,
      newProductMenu: false as boolean,
      newProduct: {
        name: "",
        description: "",
        shortDescription: "",
        price: 0,
        width: 0,
        length: 0,
        height: 0,
        weight: 0,
        url: "",
        category: ""
      } as Record<string, any>,
      categories: [] as Array<Record<string, any>>,
      errors: [],
      fileName: ""
    };
  },
  computed: {
    user() {
      return this.$store.getters["user"];
    },
    formattedCategories() {
      const categories = JSON.parse(JSON.stringify(this.categories));
      return categories.map(category => {
        return {
          name: category.name,
          value: category._id
        };
      });
    },
    vendorWebflowProduct() {
      const products = JSON.parse(JSON.stringify(this.products));
      return products.filter(product => product.product.vendor === this.user.webflow_vendor_id);
    }
  },
  mounted() {
    this.getProducts();
    this.getCategories();
  },
  methods: {
    resetProduct() {
      this.newProduct = {
        name: "",
        description: "",
        shortDescription: "",
        price: 0,
        width: 0,
        length: 0,
        height: 0,
        weight: 0,
        url: "",
      } as Record<string, any>;
      this.fileName = "";
      this.resetLoader();
    },
    resetLoader() {
      this.preloader.show = false;
      this.preloader.text = "";
    },
    newProductModal() {
      this.newProductMenu = true;
    },
    logout() {
      this.$store.commit('logout', {});
      this.$router.push("/login");
    },
    async getCategories() {
      try {
        const categories: { data: WebflowCollectionResponseInterface } = await client.get(
          `integrations/webflow/collections/${process.env.VUE_APP_WEBFLOW_CATEGORIES_COLLECTION_ID}/items`);
        this.categories = categories.data.items;
      } catch (e) {
        console.error(e)
      }
    },
    formatProduct() {
      const product = this.newProduct;
      const productSlug = product.name.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      const skuSug = `${productSlug}-default`;
      return {
        product: {
          fields: {
            shippable: true,
            _archived: false,
            _draft: false,
            name: product.name,
            description: product.description,
            "short-description": product.shortDescription,
            slug: productSlug,
            vendor: this.user.webflow_vendor_id,
            category: [product.category]
          }
        },
        sku: {
          fields: {
            _archived: false,
            _draft: false,
            name: product.name,
            slug: skuSug,
            "main-image": "",
            price: {unit: 'USD', value: parseInt(product.price)},
            width: parseInt(product.width),
            length: parseInt(product.length),
            height: parseInt(product.height),
            weight: parseInt(product.weight),
          },
        }
      };
    },
    async createProduct() {
      try {
        const formattedProduct = this.formatProduct();
        this.preloader.show = true;
        this.preloader.text = "Creating product...";
        const product = await client.post("/rest/collections/products", {
          image: this.newProduct.url,
          name: formattedProduct.product.fields.name
        });
        formattedProduct.sku.fields["main-image"] = product.data.data.image;
        const webflowProduct = await client.post(
          `/integrations/webflow/sites/${process.env.VUE_APP_WEBFLOW_SITE_ID}/products`, formattedProduct);
        await client.patch(`/rest/collections/products/${product.data.data.uid}`, {
          webflow_product_id: webflowProduct.data.product._id
        });
        this.newProductMenu = false;
        await this.getProducts();
        this.resetProduct();
      } catch (e) {
        console.error(e)
        this.resetLoader();
      }
    },
    async getProducts() {
      try {
        const products: { data: WebflowCollectionResponseInterface } = await client.get(
          `/integrations/webflow/sites/${process.env.VUE_APP_WEBFLOW_SITE_ID}/products`);
        this.products = products.data.items;
        const vendorProducts = await client.get(`/rest/collections/products`, {
          params: {
            where: JSON.stringify([{attribute: "author", operator: "==", value: this.user.uid}])
          }
        });
        this.vendorProducts = vendorProducts.data.data;
      } catch (e) {
        console.error(e)
      }
    },
    handleFileUpload() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const file = this.$refs.file.files[0];
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.newProduct.url = e.target.result;
      };
      reader.readAsDataURL(file);
    },
  }
});
</script>

<style lang="scss" scoped>
.dashboard-wrapper {
  padding: 100px 10%;
  position: relative;

  .logout-button {
    background: none;
    border: none;
    position: absolute;
    cursor: pointer;
    right: 20px;
    top: 20px;

    img {
      width: 20px;
      height: 20px;
      transition: opacity 0.2s ease-in-out;

      &:hover {
        opacity: 0.4;
      }
    }
  }
}

.product {
  display: flex;
  width: 31%;
  margin-bottom: 50px;
  padding-right: 10px;
  padding-left: 10px;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-flex: 0;
  -webkit-flex: 0 auto;
  -ms-flex: 0 auto;
  flex: 0 auto;
  text-align: center;

  .product-image {
    width: 300px;
    height: 380px;
    background-position: center;
    background-size: cover;
  }

  .product-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h2 {
      display: inline-block;
      margin-bottom: 5px;
      color: #1d1f2e;
      font-size: 20px;
      line-height: 30px;
      font-weight: 400;
      text-align: center;
    }

    span {
      display: inline-block;
      color: rgba(29, 31, 46, 0.7);
      font-family: Karla, sans-serif;
      font-size: 16px;
      line-height: 28px;
      font-weight: 400;
      text-transform: capitalize;
    }
  }
}

.my-products-nav {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: end;
  margin-bottom: 50px;
}

.my-products {
  display: flex;
  margin: 0 -10px;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  flex-direction: row;
  -webkit-box-pack: center;
  justify-content: flex-start;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-box-align: start;
  align-items: flex-start;
  align-content: flex-start;
}

.tabs {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .tab {
    margin-right: 20px;
    cursor: pointer;
    background: none;
    transition: color 0.2s ease-in-out, border-color 0.2s ease-in-out;
    padding: 10px 16px;
    height: fit-content;
    border: 1px solid #ececed;
    opacity: 1;
    font-size: 12px;
    line-height: 18px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;

    &.active {
      border-color: rgba(162, 95, 75, 0.4);
      opacity: 1;
      color: #a25f4b;
    }
  }
}

.new-product {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #ffffff;
  border-right: 1px solid #ececed;
  overflow-x: hidden;
  padding-top: 60px;
  transition: 0.5s;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  position: absolute;
  left: 10px;
  top: 10px;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 0.4;
    }
  }
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 90%;

  .choice {
    font-size: 16px;
    line-height: 30px;
    text-align: center;
  }

  .error {
    color: #a25f4b;
    margin: 20px;
  }
}

.file-upload {
  width: 100%;
  height: 40px;
  display: flex;
  margin-bottom: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 2px dashed #ececed;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 16px;
  line-height: 30px;
  text-align: center;
  color: #a25f4b;
  transition: border-color 0.2s ease-in-out;

  &:focus {
    border-color: #a25f4b;
  }
}

.file-name {
  color: #a25f4b;
  margin: 20px;
  font-size: 12px;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Beginning of string */
  direction: rtl;
  text-align: left;
}

.grid-container {
  display: grid;
  width: 100%;
  grid-template-columns: auto auto;
}
</style>