

collection User{ 

    id: String;
    
    @read
    publicKey: publicKey;

    constructor(){ 
        if (!publicKey) { 

            error("You must sign the transaction");
        }
        this.id = id;
        this.publicKey = publicKey;
    }



}


collection NFT{ 

    id: String;
    owner: User

    constructor(id:String, owner: User){ 

        this.id = id;
        this.owner = owner;

    }
}


collection Message{ 

    id: String;
    message: String;
    timestamp: Number;
    chat: Chat;

    constructor(id : String, message: String, timestamp : Number, chat: Chat){ 



    }
}