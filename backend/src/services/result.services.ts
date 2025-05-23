import { prisma } from '../db/prisma.client';

export class ResultService {
    get = async (id: string) => {
        return await prisma.results.findFirst({
            where: { id: id },
            include:{
                exam:{
                    include:{
                        assessment:{
                            include:{
                                technologies:{
                                    include:{
                                        technology:true
                                    }
                                }
                            }
                        },
                        candidate:true
                    }
                },
                answers:{
                    include:{
                        question:{
                            include:{
                                technology:true
                            }
                        }
                    }
                }
            }
        })
    }
}
