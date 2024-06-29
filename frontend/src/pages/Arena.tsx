// import GameArena from "../components/arena/GameArena"
import GameLayout from "../components/arena/GameLayout"

//   type Duel = {
//     duel_id: number;
//     is_active: boolean;
//     is_completed: boolean;
//     has_stake: boolean;
//     stake_amount: number;
//     difficulty: string;
//     duel_creator: string;
//     creator_warriors: string; // JSON string of Warrior[]
//     creators_strategy: string;
//     duel_opponent: string;
//     opponent_warriors: string; // JSON string of Warrior[]
//     opponents_strategy: string;
//     battle_log: string; // JSON string of steps
//     duel_winner: string;
//     duel_loser: string;
//     creation_time: number;
//   };


  


const Arena = () => {
    return (
        <main className="w-full flex flex-col">
             <GameLayout  />

        </main>
    )
}

// const duel: Duel = {
//     duel_id: 2,
//     is_active: true,
//     is_completed: false,
//     has_stake: false,
//     stake_amount: 0,
//     difficulty: "Easy",
//     duel_creator: "0xa771e1625dd4faa2ff0a41fa119eb9644c9a46c8",
//     creator_warriors: '[{"char_id":23},{"char_id":22},{"char_id":21}]',
//     creators_strategy: "Yet_to_select",
//     duel_opponent: "0xnebula",
//     opponent_warriors: '[{"char_id":3},{"char_id":8},{"char_id":1}]',
//     opponents_strategy: "Yet_to_select",
//     battle_log: '[{"char_id": 23},{"char_id":22},{"char_id":21}]',
//     duel_winner: "",
//     duel_loser: "",
//     creation_time: 1719575044,
//   };


export default Arena


// , {"id": 8, "id": 23}, {"id": 21, "id": 1}, {"id": 1, "id": 22}, {"id": 23, "id": 3}, {"id": 8, "id": 23}, {"id": 21, "id": 1}, {"id": 1, "id": 22}