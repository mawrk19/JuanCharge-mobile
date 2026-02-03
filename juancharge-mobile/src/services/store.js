import { reactive } from 'vue';

export const store = reactive({
    userPoints: 0,

    setPoints(points) {
        this.userPoints = points;
    },

    addPoints(points) {
        this.userPoints += points;
    },

    subtractPoints(points) {
        this.userPoints -= points;
    }
});
