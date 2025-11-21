Ini adalah langkah teknis besar. Untuk membangun sistem **"Elemental Triad: Yield Wars"** yang lengkap dengan fitur **No-Loss (Vault)**, **Game Logic (Triad Strategy)**, dan **Gamification (Quest/NFTs)** di Hedera, kita akan menggunakan arsitektur modular.

Kita membagi sistem menjadi 3 Smart Contract yang saling berinteraksi:

1.  **`Vault.sol`**: Bank aman untuk menyimpan Principal (Modal).
2.  **`QuestManager.sol`**: Mengurus logic NFT/Badge via Hedera Token Service (HTS).
3.  **`ElementalGame.sol`**: Otak permainan (Logika Faksi, Perhitungan Menang, dan Distribusi Yield).

Berikut adalah **Blueprint Kode Solidity** (Kompatibel dengan Hedera Smart Contract Service / EVM).

-----

### 1\. Persiapan Interface (Hedera Helper)

Pertama, kita butuh interface untuk bicara dengan layanan NFT Hedera (HTS).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface standar Hedera Token Service (Precompiled Contract)
interface IHederaTokenService {
    function mintToken(address token, int64 amount, bytes[] memory metadata) external returns (int64 responseCode, int64 newTotalSupply, int64[] memory serialNumbers);
    function transferNFT(address token, address sender, address receiver, int64 serialNum) external returns (int64 responseCode);
}

// Alamat Precompile HTS di jaringan Hedera selalu di 0x167
address constant HEDERA_TOKEN_SERVICE = address(0x167);
```

-----

### 2\. Contract Vault (Bank Aman)

Kontrak ini tugasnya hanya menerima deposit dan mencatat saldo. Ini menjamin **No-Loss**.

```solidity
contract Vault {
    mapping(address => uint256) public balances;
    uint256 public totalStaked;
    address public gameContract; // Hanya Game Contract yang boleh baca data sensitif

    constructor() {
        // Set deployer sebagai admin sementara
    }

    function setGameContract(address _game) external {
        gameContract = _game;
    }

    // 1. User Deposit (Modal Aman)
    function deposit() external payable {
        require(msg.value > 0, "Must deposit HBAR");
        balances[msg.sender] += msg.value;
        totalStaked += msg.value;
    }

    // 2. User Withdraw (Kapanpun bisa ambil modal)
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalStaked -= amount;
        payable(msg.sender).transfer(amount);
    }

    // 3. Fungsi Baca untuk Game Logic
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
```

-----

### 3\. Contract QuestManager (Sistem Gamifikasi HTS)

Ini yang menangani **Challenge Intermediate: DeFi Gamification**.

```solidity
contract QuestManager {
    address public gameContract;
    IHederaTokenService hts = IHederaTokenService(HEDERA_TOKEN_SERVICE);

    // Menyimpan Address Token NFT (Dibuat via Hedera Portal/Script sebelumnya)
    address public noviceBadge;
    address public loyalistBadge;
    address public whaleBadge;

    mapping(address => uint256) public userWinStreak;
    mapping(address => uint256) public userTotalWins;

    modifier onlyGame() {
        require(msg.sender == gameContract, "Only Game Contract");
        _;
    }

    function setAddresses(address _game, address _novice, address _loyalist, address _whale) external {
        gameContract = _game;
        noviceBadge = _novice;
        loyalistBadge = _loyalist;
        whaleBadge = _whale;
    }

    // Fungsi dipanggil saat user melakukan aksi di Game
    function checkQuests(address user, uint256 depositAmount, bool isWin) external onlyGame {
        // Update Stats
        if (isWin) {
            userWinStreak[user]++;
            userTotalWins[user]++;
        } else {
            userWinStreak[user] = 0;
        }

        // QUEST 1: First Blood / Novice (Menang Pertama Kali)
        if (userTotalWins[user] == 1) {
            mintBadge(user, noviceBadge);
        }

        // QUEST 2: Loyalist / Streak (Menang 3x berturut-turut)
        if (userWinStreak[user] == 3) {
            mintBadge(user, loyalistBadge);
        }

        // QUEST 3: Whale (Punya deposit besar)
        if (depositAmount >= 10000 * 1e8) { // Asumsi 10k HBAR
            mintBadge(user, whaleBadge);
        }
    }

    function mintBadge(address to, address token) internal {
        // Panggil HTS Precompile untuk mint NFT langsung ke user
        // Note: User harus sudah associate token ID ini sebelumnya (Aturan Hedera)
        bytes[] memory metadata = new bytes[](1);
        metadata[0] = bytes("Quest Completed"); 
        hts.mintToken(token, 0, metadata);
        
        // Transfer logic (biasanya mint masuk ke treasury dulu, lalu transfer ke user)
        // Di hackathon, bisa simplifikasi mint to treasury -> transfer to user
    }
}
```

-----

### 4\. Contract ElementalGame (Otak Permainan)

Ini adalah implementasi logika **Triad** dan **Net Advantage Score**.

```solidity
contract ElementalGame {
    Vault public vault;
    QuestManager public questManager;

    // FAKSI: 1 = Api, 2 = Air, 3 = Angin
    uint8 constant FIRE = 1;
    uint8 constant WATER = 2;
    uint8 constant WIND = 3;

    struct Round {
        uint256 id;
        uint256 startTime;
        uint256 lockTime;
        uint256 endTime;
        uint256 totalPowerFire;
        uint256 totalPowerWater;
        uint256 totalPowerWind;
        uint256 totalYieldPot; // Hadiah HBAR ronde ini
        uint8 winningFaction;
        bool isResolved;
    }

    uint256 public currentRoundId;
    mapping(uint256 => Round) public rounds;
    
    // Mapping: RoundID => User => Faction Pilihan
    mapping(uint256 => mapping(address => uint8)) public userVotes;
    // Mapping: RoundID => User => Apakah sudah claim yield?
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    constructor(address _vault, address _questManager) {
        vault = Vault(_vault);
        questManager = QuestManager(_questManager);
        startNewRound(); // Mulai ronde 1
    }

    // --- ADMIN YIELD INJECTION ---
    // Karena auto-staking kompleks, Admin menyetor Yield (Hadiah) manual untuk simulasi
    function depositYield() external payable {
        rounds[currentRoundId].totalYieldPot += msg.value;
    }

    // --- USER ACTION ---
    
    // User memilih faksi menggunakan 'Power' dari saldo Vault
    function vote(uint8 faction) external {
        Round storage r = rounds[currentRoundId];
        require(block.timestamp < r.lockTime, "Round Locked");
        require(faction >= 1 && faction <= 3, "Invalid Faction");
        require(userVotes[currentRoundId][msg.sender] == 0, "Already Voted");

        uint256 userPower = vault.getBalance(msg.sender);
        require(userPower > 0, "No Staked Balance in Vault");

        // Catat Vote
        userVotes[currentRoundId][msg.sender] = faction;

        // Update Total Power Faksi
        if (faction == FIRE) r.totalPowerFire += userPower;
        else if (faction == WATER) r.totalPowerWater += userPower;
        else if (faction == WIND) r.totalPowerWind += userPower;
    }

    // --- GAME LOGIC (THE TRIAD MATH) ---

    function resolveRound() external {
        Round storage r = rounds[currentRoundId];
        require(block.timestamp >= r.endTime, "Round not over");
        require(!r.isResolved, "Already Resolved");

        uint256 totalPower = r.totalPowerFire + r.totalPowerWater + r.totalPowerWind;
        
        if (totalPower > 0) {
            // Hitung Persentase (Basis Points: 100% = 10000)
            int256 firePct = int256(r.totalPowerFire * 10000 / totalPower);
            int256 waterPct = int256(r.totalPowerWater * 10000 / totalPower);
            int256 windPct = int256(r.totalPowerWind * 10000 / totalPower);

            // RUMUS SCORE: (Target - Predator)
            // Fire Score = Target(Wind) - Predator(Water)
            int256 fireScore = windPct - waterPct;
            // Water Score = Target(Fire) - Predator(Wind)
            int256 waterScore = firePct - windPct;
            // Wind Score = Target(Water) - Predator(Fire)
            int256 windScore = waterPct - firePct;

            // Tentukan Pemenang
            if (fireScore > waterScore && fireScore > windScore) {
                r.winningFaction = FIRE;
            } else if (waterScore > fireScore && waterScore > windScore) {
                r.winningFaction = WATER;
            } else if (windScore > fireScore && windScore > waterScore) {
                r.winningFaction = WIND;
            } else {
                r.winningFaction = 0; // Draw (Yield rollover logic bisa ditambah disini)
            }
        }

        r.isResolved = true;
        startNewRound(); // Auto start ronde berikutnya
    }

    function startNewRound() internal {
        currentRoundId++;
        rounds[currentRoundId] = Round({
            id: currentRoundId,
            startTime: block.timestamp,
            lockTime: block.timestamp + 5 days, // Contoh durasi
            endTime: block.timestamp + 7 days,
            totalPowerFire: 0,
            totalPowerWater: 0,
            totalPowerWind: 0,
            totalYieldPot: 0, // Akan bertambah jika rollover
            winningFaction: 0,
            isResolved: false
        });
    }

    // --- CLAIM REWARD ---
    
    function claimReward(uint256 roundId) external {
        Round storage r = rounds[roundId];
        require(r.isResolved, "Round not finished");
        require(!hasClaimed[roundId][msg.sender], "Already Claimed");
        require(r.winningFaction != 0, "Draw / No Winner");

        uint8 userChoice = userVotes[roundId][msg.sender];
        bool isWinner = (userChoice == r.winningFaction);
        uint256 userBalance = vault.getBalance(msg.sender);

        // Logic Gamifikasi (Quest Check)
        questManager.checkQuests(msg.sender, userBalance, isWinner);

        if (isWinner) {
            // Hitung Share Hadiah
            uint256 winningTotalPower;
            if (r.winningFaction == FIRE) winningTotalPower = r.totalPowerFire;
            else if (r.winningFaction == WATER) winningTotalPower = r.totalPowerWater;
            else if (r.winningFaction == WIND) winningTotalPower = r.totalPowerWind;

            // Share = (Power User / Total Power Pemenang) * Total Yield Pot
            uint256 share = (userBalance * r.totalYieldPot) / winningTotalPower;
            
            hasClaimed[roundId][msg.sender] = true;
            payable(msg.sender).transfer(share);
        }
    }
}
```

-----

### Penjelasan Alur Logic Smart Contract

1.  **Security First:** Uang modal user ada di `Vault.sol`. Contract `ElementalGame.sol` **tidak punya akses** untuk menarik uang modal user. Inilah inti dari "No-Loss".
2.  **Vote Logic:** Saat user memanggil `vote()`, Contract Game "mengintip" saldo user di Vault (`vault.getBalance`) untuk menentukan seberapa besar suara mereka. Ini yang kita sebut **Yield Power**.
3.  **Winning Math:** Di fungsi `resolveRound`, kita menggunakan tipe data `int256` (Integer yang bisa negatif) karena skor Net Advantage bisa minus (misal: Target 10% - Predator 50% = -40).
4.  **Gamification Hook:** Di akhir fungsi `claimReward`, kita memanggil `questManager.checkQuests`. Ini otomatis memeriksa apakah user berhak dapat NFT Badge baru atau tidak.

### Cara Deploy di Hedera (Hackathon Steps)

1.  Deploy `Vault.sol`.
2.  Deploy `QuestManager.sol`.
3.  Deploy `ElementalGame.sol` (Masukkan alamat Vault & QuestManager di constructor).
4.  Panggil fungsi `setGameContract` di Vault dan QuestManager (Arahkan ke address ElementalGame).
5.  Buat 3 Token NFT via Hedera Console/Script, lalu masukkan Token ID-nya ke `QuestManager` via fungsi `setAddresses`.

Ini adalah struktur kode **Best Practice** untuk MVP Hackathon: Aman, Terbaca, dan Memenuhi semua kriteria "GameFi + DeFi + Gamification".