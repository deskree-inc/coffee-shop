<template>
  <div class="dashboard-wrapper">
    <loading-spinner :text="preloader.text" :show="preloader.show"></loading-spinner>
    <button class="logout-button" @click="logout">
      <img src="@/assets/logout.svg" alt="logout">
    </button>
    <div class="my-products-nav">
      <div class="tabs">
        <button class="tab" v-for="tab in tabs" :class="{active: tab === currentTab}" @click="setActiveTab(tab)"
                :key="tab">
          {{ tab.replace(/-/g, " ") }}
        </button>
      </div>
      <button-primary text="New Product" @click="newProduct"></button-primary>
    </div>
    <div class="my-products" v-if="currentTab === 'my-recipes'">
      <div class="product" v-for="recipe in myRecipes" :key="recipe._id">
        <div class="product-image" :style="{'background-image': `url(${recipe.image.url})`}"
             v-if="recipe.hasOwnProperty('image')">
        </div>
        <div class="product-info">
          <h2>{{ recipe.name }}</h2>
          <span>{{ user.name }}</span>
        </div>
      </div>
    </div>
    <div class="my-products" v-if="currentTab === 'all-recipes'">
      <div class="product" v-for="recipe in recipes" :key="recipe._id">
        <div class="product-image" :style="{'background-image': `url(${recipe.image.url})`}"
             v-if="recipe.hasOwnProperty('image')">
        </div>
        <div class="product-info">
          <h2>{{ recipe.name }}</h2>
          <span v-if="recipe.author_name">{{ recipe.author_name }}</span>
        </div>
      </div>
    </div>
    <div class="new-product" :style="{width: newProductMenu ? '25%' : 0}">
      <button class="close-button" @click="newProductMenu = false">
        <img src="@/assets/close.svg" alt="close">
      </button>
      <div class="form">
        <h1>New Product</h1>
        <input-field name="name" placeholder="Recipes name" type="text" v-model="newRecipe.name"></input-field>
        <input-field name="description" placeholder="Description" type="text" v-model="newRecipe.description"></input-field>
        <span class="error" v-if="errors.length > 0">{{ errors[0].detail }}</span>
        <label for="file" class="file-upload">
          Upload image
        </label>
        <span class="file-name" v-if="fileName.length > 0">{{ fileName }}</span>
        <input type="file" id="file" ref="file" v-on:change="handleFileUpload" style="display: none"/>
        <button-primary text="Create Recipe" @click="createRecipe"></button-primary>
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

export default defineComponent({
  name: 'DashboardView',
  components: {ButtonPrimary, InputField, LoadingSpinner},
  data() {
    return {
      preloader: {
        text: "",
        show: false
      },
      recipesUrl: `/integrations/webflow/collections/${process.env.VUE_APP_WEBFLOW_RECIPES_COLLECTION_ID}/items`,
      authorsUrl: `/integrations/webflow/collections/${process.env.VUE_APP_WEBFLOW_USERS_COLLECTION_ID}/items`,
      recipes: [] as Array<Record<string, any>>,
      tabs: ["my-recipes", "all-recipes"] as Array<string>,
      currentTab: "my-recipes" as string,
      newProductMenu: false as boolean,
      newRecipe: {
        name: "",
        image: "",
        description: "",
      } as Record<string, any>,
      errors: [],
      fileName: "",
    };
  },
  computed: {
    user() {
      return this.$store.getters["user"];
    },
    myRecipes() {
      const recipes = JSON.parse(JSON.stringify(this.recipes));
      return recipes.filter(recipe => recipe.author === this.user.webflow_author_id);
    },
  },
  mounted() {
    this.getRecipes();
  },
  methods: {
    resetLoader() {
      this.preloader.show = false;
      this.preloader.text = "";
    },
    newProduct() {
      this.newProductMenu = true;
    },
    logout() {
      this.$store.commit('logout', {});
      this.$router.push("/login");
    },
    async createRecipe() {
      try {
        this.preloader.show = true;
        this.preloader.text = "Creating recipe...";
        const recipe = await client.post("/rest/collections/recipes", this.newRecipe);
        this.newRecipe.image = recipe.data.data.image;
        this.newRecipe["author"] = this.user.webflow_author_id;
        this.newRecipe["_archived"] = false;
        this.newRecipe["_draft"] = false;
        await client.post(this.recipesUrl, {
          fields: this.newRecipe
        });
        this.newRecipe = {
          name: "",
          image: "",
          description: "",
        } as Record<string, any>;
        this.newProductMenu = false;
        await this.getRecipes();
        this.resetLoader();
        this.fileName = "";
      } catch (e) {
        this.fileName = "";
        console.error(e)
        this.resetLoader();
      }
    },
    setActiveTab(tab: string) {
      this.currentTab = tab;
    },
    async getRecipes() {
      try {
        const recipes: { data: WebflowCollectionResponseInterface } = await client.get(this.recipesUrl);
        const authors: { data: WebflowCollectionResponseInterface } = await client.get(this.authorsUrl);
        this.recipes = recipes.data.items.map((obj) => {
          const author = authors.data.items.find(author => author._id === obj.author) as Record<string, any>;
          obj["author_name"] = author.name;
          return obj
        });
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
        this.newRecipe.image = e.target.result;
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
  justify-content: space-between;
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
</style>